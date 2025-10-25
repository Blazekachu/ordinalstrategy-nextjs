import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// API Keys from environment variables (SECURE)
const API_KEYS = {
  ordiscan: process.env.ORDISCAN_API_KEY || '',
  hiro: process.env.HIRO_API_KEY || '',
  unisat: process.env.UNISAT_API_KEY || '',
  okx: process.env.OKX_ACCESS_KEY || '',
};

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
              'Authorization': API_KEYS.ordiscan ? `Bearer ${API_KEYS.ordiscan}` : '',
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
            // Calculate charms
            const charms: string[] = [];
            if (insc.inscription_number < 0) charms.push('cursed');
            
            allInscriptionsMap.set(insc.inscription_id, {
              id: insc.inscription_id,
              number: insc.inscription_number,
              address: insc.address,
              content_type: insc.content_type,
              content_length: insc.content_length,
              timestamp: new Date(insc.timestamp).getTime(),
              tx_id: insc.genesis_transaction,
              content: `https://ordinals.com/content/${insc.inscription_id}`,
              charms: charms,
              sat: insc.sat,
            });
            count++;
          }
        });

        page++;
        if (inscriptions.length < size) hasMore = false;
        if (count >= reportedTotal) hasMore = false; // Stop when we have all
      }

      const blessed = Array.from(allInscriptionsMap.values()).filter(i => i.number >= 0).length;
      const cursed = Array.from(allInscriptionsMap.values()).filter(i => i.number < 0).length;
      console.log(`✅ [Backend/Ordiscan] Added ${count} inscriptions (${blessed} blessed, ${cursed} cursed)`);
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
              'Authorization': API_KEYS.unisat ? `Bearer ${API_KEYS.unisat}` : '',
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
            // Calculate charms
            const charms: string[] = [];
            if (insc.inscriptionNumber < 0) charms.push('cursed');
            
            allInscriptionsMap.set(insc.inscriptionId, {
              id: insc.inscriptionId,
              number: insc.inscriptionNumber,
              address: insc.address,
              content_type: insc.contentType,
              content_length: insc.contentLength,
              timestamp: insc.timestamp,
              tx_id: insc.genesisTransaction,
              content: `https://ordinals.com/content/${insc.inscriptionId}`,
              charms: charms,
              sat: insc.sat,
            });
            count++;
          }
        });

        cursor += size;
        if (inscriptions.length < size) break;
        if (count >= reportedTotal) break;
      }

      const blessed = Array.from(allInscriptionsMap.values()).filter(i => i.number >= 0).length;
      const cursed = Array.from(allInscriptionsMap.values()).filter(i => i.number < 0).length;
      console.log(`✅ [Backend/Unisat] Added ${count} inscriptions (${blessed} blessed, ${cursed} cursed)`);
    } catch (error) {
      console.warn('⚠️ [Backend/Unisat] Failed:', error);
    }

    // ============================================
    // API 3: Hiro (with pagination for ALL inscriptions including blessed AND cursed)
    // ============================================
    try {
      console.log('📡 [Backend/Hiro] Starting fetch with pagination...');
      let normalCount = 0;
      let cursedCount = 0;
      
      // Fetch BLESSED (normal) inscriptions
      let offset = 0;
      const limit = 60;
      let hasMore = true;
      let reportedTotal = 0;

      console.log('📡 [Backend/Hiro] Fetching blessed inscriptions...');
      while (hasMore && offset < 50000) {
        const response = await fetch(
          `https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&limit=${limit}&offset=${offset}`,
          {
            headers: {
              'Accept': 'application/json',
              'x-api-key': API_KEYS.hiro,
            },
          }
        );

        if (!response.ok) {
          console.warn(`⚠️ [Backend/Hiro] Failed at offset ${offset}: ${response.status}`);
          break;
        }

        const data = await response.json();
        
        if (offset === 0) {
          reportedTotal = data.total || 0;
          highestTotal = Math.max(highestTotal, reportedTotal);
          console.log(`📊 [Backend/Hiro] Total blessed: ${reportedTotal}`);
        }

        const inscriptions = data.results || [];
        if (inscriptions.length === 0) break;

        inscriptions.forEach((insc: any) => {
          if (insc.id && !allInscriptionsMap.has(insc.id)) {
            // Calculate charms
            const charms: string[] = [];
            if (insc.number < 0) charms.push('cursed');
            if (insc.charms) {
              // If API provides charms directly
              if (Array.isArray(insc.charms)) {
                charms.push(...insc.charms);
              }
            }
            // Check for vindicated (cursed but after Jubilee - block 820000)
            if (insc.number < 0 && insc.sat_block_height && insc.sat_block_height >= 820000) {
              charms.push('vindicated');
            }
            
            allInscriptionsMap.set(insc.id, {
              id: insc.id,
              number: insc.number,
              address: insc.address,
              content_type: insc.content_type,
              content_length: insc.content_length,
              timestamp: insc.timestamp,
              tx_id: insc.genesis_tx_id,
              content: `https://ordinals.com/content/${insc.id}`,
              charms: charms,
              sat: insc.sat,
            });
            normalCount++;
          }
        });

        offset += limit;
        if (inscriptions.length < limit) hasMore = false;
        if (normalCount >= reportedTotal) hasMore = false;
      }

      // Fetch CURSED inscriptions separately
      offset = 0;
      hasMore = true;
      let cursedTotal = 0;

      console.log('📡 [Backend/Hiro] Fetching cursed inscriptions...');
      while (hasMore && offset < 50000) {
        // Try with cursed=true parameter
        const response = await fetch(
          `https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&limit=${limit}&offset=${offset}&cursed=true`,
          {
            headers: {
              'Accept': 'application/json',
              'x-api-key': API_KEYS.hiro,
            },
          }
        );

        if (!response.ok) {
          console.warn(`⚠️ [Backend/Hiro] Cursed fetch failed at offset ${offset}: ${response.status}`);
          break;
        }

        const data = await response.json();
        
        if (offset === 0) {
          cursedTotal = data.total || 0;
          highestTotal = Math.max(highestTotal, reportedTotal + cursedTotal);
          console.log(`📊 [Backend/Hiro] Total cursed: ${cursedTotal}`);
        }

        const inscriptions = data.results || [];
        if (inscriptions.length === 0) break;

        inscriptions.forEach((insc: any) => {
          if (insc.id && !allInscriptionsMap.has(insc.id)) {
            // Calculate charms for cursed inscriptions
            const charms: string[] = ['cursed'];
            if (insc.charms && Array.isArray(insc.charms)) {
              charms.push(...insc.charms.filter((c: string) => c !== 'cursed'));
            }
            
            allInscriptionsMap.set(insc.id, {
              id: insc.id,
              number: insc.number,
              address: insc.address,
              content_type: insc.content_type,
              content_length: insc.content_length,
              timestamp: insc.timestamp,
              tx_id: insc.genesis_tx_id,
              content: `https://ordinals.com/content/${insc.id}`,
              charms: charms,
              sat: insc.sat,
            });
            cursedCount++;
          }
        });

        offset += limit;
        if (inscriptions.length < limit) hasMore = false;
        if (cursedCount >= cursedTotal) hasMore = false;
      }

      console.log(`✅ [Backend/Hiro] Added ${normalCount} blessed + ${cursedCount} cursed = ${normalCount + cursedCount} total inscriptions`);
    } catch (error) {
      console.warn('⚠️ [Backend/Hiro] Failed:', error);
    }

    // ============================================
    // API 4: Magic Eden (120 req/min - excellent for all inscriptions including cursed)
    // ============================================
    try {
      console.log('📡 [Backend/MagicEden] Fetching inscriptions...');
      let offset = 0;
      const limit = 100;
      let hasMore = true;
      let count = 0;

      while (hasMore && offset < 10000) { // Safety limit at 10k
        const response = await fetch(
          `https://api-mainnet.magiceden.io/v2/btc/wallets/${address}/tokens?limit=${limit}&offset=${offset}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.warn(`⚠️ [Backend/MagicEden] Failed at offset ${offset}: ${response.status}`);
          break;
        }

        const data = await response.json();
        const inscriptions = data.tokens || data || [];
        
        if (inscriptions.length === 0) break;

        inscriptions.forEach((insc: any) => {
          const inscId = insc.id || insc.inscriptionId;
          if (inscId && !allInscriptionsMap.has(inscId)) {
            // Calculate charms
            const charms: string[] = [];
            const inscNum = insc.inscriptionNumber || insc.number;
            if (inscNum < 0) charms.push('cursed');
            
            allInscriptionsMap.set(inscId, {
              id: inscId,
              number: inscNum,
              address: insc.owner || address,
              content_type: insc.contentType || insc.content_type,
              content_length: insc.contentLength || insc.content_length,
              timestamp: insc.timestamp || insc.genesisTimestamp,
              tx_id: insc.genesisTx || insc.genesis_tx_id,
              content: `https://ordinals.com/content/${inscId}`,
              charms: charms,
              sat: insc.sat,
            });
            count++;
          }
        });

        offset += limit;
        if (inscriptions.length < limit) hasMore = false;
      }

      const blessed = Array.from(allInscriptionsMap.values()).filter(i => i.number >= 0).length;
      const cursed = Array.from(allInscriptionsMap.values()).filter(i => i.number < 0).length;
      console.log(`✅ [Backend/MagicEden] Added ${count} new inscriptions (total now: ${blessed} blessed, ${cursed} cursed)`);
    } catch (error) {
      console.warn('⚠️ [Backend/MagicEden] Failed:', error);
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

