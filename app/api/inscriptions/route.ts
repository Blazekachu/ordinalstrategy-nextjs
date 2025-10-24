import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    console.log(`🔍 Backend: Fetching inscriptions for ${address}`);

    const allInscriptionsMap = new Map();
    let highestTotal = 0;

    // ============================================
    // API 1: Ordiscan (with proper pagination)
    // ============================================
    try {
      console.log('📡 [Backend/Ordiscan] Starting fetch...');
      let page = 0;
      const size = 100;
      let hasMore = true;
      let count = 0;
      let reportedTotal = 0;

      while (hasMore && page < 100) { // Max 100 pages = 10,000 inscriptions
        const response = await fetch(
          `https://api.ordiscan.com/v1/address/${address}/inscriptions?size=${size}&page=${page}`,
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ***REMOVED***`,
            },
          }
        );

        if (!response.ok) {
          console.warn(`⚠️ [Backend/Ordiscan] Failed at page ${page}: ${response.status}`);
          break;
        }

        const data = await response.json();
        
        if (page === 0) {
          reportedTotal = data.total || 0;
          highestTotal = Math.max(highestTotal, reportedTotal);
          console.log(`📊 [Backend/Ordiscan] Total: ${reportedTotal}`);
        }

        const inscriptions = data.data || [];
        if (inscriptions.length === 0) break;

        inscriptions.forEach((insc: any) => {
          if (insc.inscription_id && !allInscriptionsMap.has(insc.inscription_id)) {
            allInscriptionsMap.set(insc.inscription_id, {
              id: insc.inscription_id,
              number: insc.inscription_number,
              address: insc.address,
              content_type: insc.content_type,
              content_length: insc.content_length,
              timestamp: new Date(insc.timestamp).getTime(),
              tx_id: insc.genesis_transaction,
              content: `https://ordinals.com/content/${insc.inscription_id}`,
            });
            count++;
          }
        });

        page++;
        if (inscriptions.length < size) hasMore = false;
        if (count >= reportedTotal) hasMore = false; // Stop when we have all
      }

      console.log(`✅ [Backend/Ordiscan] Added ${count} inscriptions`);
    } catch (error) {
      console.warn('⚠️ [Backend/Ordiscan] Failed:', error);
    }

    // ============================================
    // API 2: Unisat (server-side, bypasses CORS)
    // ============================================
    try {
      console.log('📡 [Backend/Unisat] Starting fetch...');
      let cursor = 0;
      const size = 100;
      let count = 0;
      let reportedTotal = 0;

      for (let i = 0; i < 100; i++) { // Max 100 pages
        const response = await fetch(
          `https://open-api.unisat.io/v1/indexer/address/${address}/inscription-data?cursor=${cursor}&size=${size}`,
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': 'Bearer ***REMOVED***',
            },
          }
        );

        if (!response.ok) {
          console.warn(`⚠️ [Backend/Unisat] Failed at cursor ${cursor}: ${response.status}`);
          break;
        }

        const data = await response.json();
        
        if (cursor === 0) {
          reportedTotal = data.data?.total || 0;
          highestTotal = Math.max(highestTotal, reportedTotal);
          console.log(`📊 [Backend/Unisat] Total: ${reportedTotal}`);
        }

        const inscriptions = data.data?.inscription || [];
        if (inscriptions.length === 0) break;

        inscriptions.forEach((insc: any) => {
          if (insc.inscriptionId && !allInscriptionsMap.has(insc.inscriptionId)) {
            allInscriptionsMap.set(insc.inscriptionId, {
              id: insc.inscriptionId,
              number: insc.inscriptionNumber,
              address: insc.address,
              content_type: insc.contentType,
              content_length: insc.contentLength,
              timestamp: insc.timestamp,
              tx_id: insc.genesisTransaction,
              content: `https://ordinals.com/content/${insc.inscriptionId}`,
            });
            count++;
          }
        });

        cursor += size;
        if (inscriptions.length < size) break;
        if (count >= reportedTotal) break;
      }

      console.log(`✅ [Backend/Unisat] Added ${count} inscriptions`);
    } catch (error) {
      console.warn('⚠️ [Backend/Unisat] Failed:', error);
    }

    // ============================================
    // API 3: Hiro (as backup)
    // ============================================
    try {
      console.log('📡 [Backend/Hiro] Starting fetch...');
      const response = await fetch(
        `https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&limit=60`,
        {
          headers: {
            'Accept': 'application/json',
            'x-api-key': '***REMOVED***',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.total) {
          highestTotal = Math.max(highestTotal, data.total);
          console.log(`📊 [Backend/Hiro] Total: ${data.total}`);
        }

        let count = 0;
        const inscriptions = data.results || [];
        inscriptions.forEach((insc: any) => {
          if (insc.id && !allInscriptionsMap.has(insc.id)) {
            allInscriptionsMap.set(insc.id, {
              id: insc.id,
              number: insc.number,
              address: insc.address,
              content_type: insc.content_type,
              content_length: insc.content_length,
              timestamp: insc.timestamp,
              tx_id: insc.genesis_tx_id,
              content: `https://ordinals.com/content/${insc.id}`,
            });
            count++;
          }
        });
        console.log(`✅ [Backend/Hiro] Added ${count} inscriptions`);
      }
    } catch (error) {
      console.warn('⚠️ [Backend/Hiro] Failed:', error);
    }

    // Convert to array and analyze
    const inscriptions = Array.from(allInscriptionsMap.values());
    const cursedCount = inscriptions.filter(i => i.number < 0).length;
    const normalCount = inscriptions.filter(i => i.number >= 0).length;

    console.log('🎉 Backend Results:');
    console.log(`   - Total: ${inscriptions.length}`);
    console.log(`   - Normal: ${normalCount}, Cursed: ${cursedCount}`);
    console.log(`   - Highest reported total: ${highestTotal}`);

    return NextResponse.json({
      success: true,
      inscriptions,
      total: highestTotal || inscriptions.length,
      stats: {
        fetched: inscriptions.length,
        reported: highestTotal,
        cursed: cursedCount,
        normal: normalCount,
      },
    });
  } catch (error) {
    console.error('Error in backend inscription fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inscriptions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

