import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NFTCard from '../components/NFTCard';
import '../components/Marketplace.css';
import useApi from '../hooks/useApi';

const METADATA_BASE = (process.env.REACT_APP_METADATA_BASE || 'https://dragnpuff.xyz/metadata').replace(/\/$/, '');
const RARITY_WEIGHTS = {
  legendary: 5,
  epic: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

const rarityWeight = (rarity) => RARITY_WEIGHTS[rarity?.toLowerCase()] || 1;

const buildFallbackMetadata = (tokenId) => {
  const elements = ['Fire', 'Air', 'Water', 'Earth'];
  const colors = ['Crimson', 'Azure', 'Obsidian', 'Emerald'];
  const moods = ['Focused', 'Playful', 'Calm', 'Fierce'];

  return {
    name: `DragN'Puff #${tokenId}`,
    description: 'Metadata preview generated locally while live metadata loads.',
    image: `${METADATA_BASE}/images/${tokenId}.png`,
    rarity: tokenId % 11 === 0 ? 'Epic' : tokenId % 5 === 0 ? 'Rare' : 'Common',
    attributes: [
      { trait_type: 'Element', value: elements[tokenId % elements.length] },
      { trait_type: 'Color', value: colors[tokenId % colors.length] },
      { trait_type: 'Mood', value: moods[tokenId % moods.length] },
    ],
  };
};

const normalizeMetadata = (meta, tokenId, source = 'fetched') => {
  const rarity = (meta.properties?.rarity || meta.rarity || 'Common').toString();
  const rarityScore = rarityWeight(rarity);
  const attributes = meta.attributes || [];
  const traitMap = attributes.reduce((acc, attr) => {
    if (attr?.trait_type) {
      acc[attr.trait_type] = attr.value;
    }
    return acc;
  }, {});
  const estimatedPrice = Number((0.04 + rarityScore * 0.02).toFixed(2));

  return {
    id: tokenId,
    tokenId,
    name: meta.name || `DragN'Puff #${tokenId}`,
    description: meta.description || "DragN'Puff collectible",
    image: meta.image || `${METADATA_BASE}/images/${tokenId}.png`,
    rarity,
    rarityScore,
    attributes,
    traitMap,
    listed: false,
    price: estimatedPrice,
    owner: meta.owner || null,
    contractAddress: meta.contract || meta.contractAddress || '',
    likes: meta.likes || 0,
    source,
  };
};

const fetchMetadata = async (tokenId) => {
  try {
    const response = await fetch(`${METADATA_BASE}/${tokenId}.json`);
    if (!response.ok) {
      throw new Error('Metadata not found');
    }
    const meta = await response.json();
    return normalizeMetadata(meta, tokenId, 'fetched');
  } catch (err) {
    return normalizeMetadata(buildFallbackMetadata(tokenId), tokenId, 'fallback');
  }
};

const buildTraitOptions = (items) => {
  const index = {};
  items.forEach((item) => {
    (item.attributes || []).forEach((attr) => {
      if (!index[attr.trait_type]) {
        index[attr.trait_type] = new Set();
      }
      index[attr.trait_type].add(attr.value);
    });
  });
  return Object.fromEntries(
    Object.entries(index).map(([trait, values]) => [trait, Array.from(values).sort()])
  );
};

const Trade = () => {
  const [tokensWindow, setTokensWindow] = useState({ start: 1, count: 18 });
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [traitOptions, setTraitOptions] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    rarity: 'all',
    sort: 'rarity',
    traitType: '',
    traitValue: '',
    activeTraits: [],
  });

  const { data: floorData } = useApi('/api/marketplace/floor-price', {});
  const { data: volumeData } = useApi('/api/marketplace/volume', {});

  const loadWindow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenIds = Array.from({ length: tokensWindow.count }, (_, idx) => tokensWindow.start + idx);
      const results = await Promise.all(tokenIds.map((id) => fetchMetadata(id)));
      setNfts(results.filter(Boolean));
      setTraitOptions(buildTraitOptions(results));
    } catch (err) {
      setError(err.message || 'Failed to load metadata');
    } finally {
      setLoading(false);
    }
  }, [tokensWindow]);

  useEffect(() => {
    loadWindow();
  }, [loadWindow]);

  const filteredNfts = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return [...nfts]
      .filter((nft) => {
        const matchesSearch = term
          ? nft.name.toLowerCase().includes(term) || nft.tokenId.toString().includes(term)
          : true;
        const matchesRarity = filters.rarity === 'all'
          ? true
          : nft.rarity.toLowerCase() === filters.rarity;
        const matchesTraits = filters.activeTraits.every((trait) => nft.traitMap[trait.trait_type] === trait.value);
        return matchesSearch && matchesRarity && matchesTraits;
      })
      .sort((a, b) => {
        if (filters.sort === 'rarity') {
          return b.rarityScore - a.rarityScore || b.tokenId - a.tokenId;
        }
        if (filters.sort === 'id-asc') {
          return a.tokenId - b.tokenId;
        }
        if (filters.sort === 'id-desc') {
          return b.tokenId - a.tokenId;
        }
        return a.name.localeCompare(b.name);
      });
  }, [nfts, filters]);

  const rarityBreakdown = useMemo(() => {
    const tally = { legendary: 0, epic: 0, rare: 0, uncommon: 0, common: 0 };
    filteredNfts.forEach((nft) => {
      const key = nft.rarity.toLowerCase();
      tally[key] = (tally[key] || 0) + 1;
    });
    return tally;
  }, [filteredNfts]);

  const estimatedFloor = useMemo(() => {
    const priced = filteredNfts.filter((nft) => typeof nft.price === 'number');
    if (!priced.length) return null;
    return Math.min(...priced.map((nft) => nft.price)).toFixed(2);
  }, [filteredNfts]);

  const displayedFloor = floorData?.floorPrice || estimatedFloor;

  const addTraitFilter = () => {
    if (!filters.traitType || !filters.traitValue) return;
    const alreadyAdded = filters.activeTraits.some(
      (t) => t.trait_type === filters.traitType && t.value === filters.traitValue
    );
    if (alreadyAdded) return;
    setFilters((prev) => ({
      ...prev,
      activeTraits: [...prev.activeTraits, { trait_type: filters.traitType, value: filters.traitValue }],
      traitType: '',
      traitValue: '',
    }));
  };

  const removeTraitFilter = (trait_type, value) => {
    setFilters((prev) => ({
      ...prev,
      activeTraits: prev.activeTraits.filter((t) => !(t.trait_type === trait_type && t.value === value)),
    }));
  };

  const handleWindowChange = (key, value) => {
    setTokensWindow((prev) => ({ ...prev, [key]: Math.max(1, Number(value) || prev[key]) }));
  };

  const rarityLegend = [
    { label: 'Legendary', key: 'legendary' },
    { label: 'Epic', key: 'epic' },
    { label: 'Rare', key: 'rare' },
    { label: 'Uncommon', key: 'uncommon' },
    { label: 'Common', key: 'common' },
  ];

  return (
    <div className="trade-page">
      <section className="trade-hero">
        <div>
          <p className="helper-text">Marketplace - Read-only discovery</p>
          <h1>Trade & Traits</h1>
          <p>Browse DragN'Puff metadata by trait, rarity, and token window. Listing and buying hooks will wire in after discovery feels solid.</p>
          <div className="trade-actions">
            <button className="btn btn-primary" onClick={loadWindow} disabled={loading}>
              Refresh window
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setTokensWindow((prev) => ({ ...prev, start: prev.start + prev.count }))}
              disabled={loading}
            >
              Next window
            </button>
            <button
              className="btn btn-tertiary"
              onClick={() => setFilters((prev) => ({ ...prev, search: '', rarity: 'all', activeTraits: [] }))}
              disabled={loading}
            >
              Clear filters
            </button>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Floor (API or est.)</div>
            <div className="value">{displayedFloor ? `${displayedFloor} ETH` : '—'}</div>
            <div className="subtext">Live /api/marketplace/floor-price with est. fallback</div>
          </div>
          <div className="stat-card">
            <div className="label">Rarity surfacing</div>
            <div className="value">{filteredNfts.length} shown</div>
            <div className="subtext">{nfts.length} loaded · {Object.keys(traitOptions).length} trait types</div>
          </div>
          <div className="stat-card">
            <div className="label">Volume (mock)</div>
            <div className="value">{volumeData?.weekly ? `${volumeData.weekly} ETH` : '—'}</div>
            <div className="subtext">Weekly sample from /api/marketplace/volume</div>
          </div>
          <div className="stat-card">
            <div className="label">Active trait filters</div>
            <div className="value">{filters.activeTraits.length}</div>
            <div className="subtext">Stack filters to narrow to precise dragons</div>
          </div>
        </div>
      </section>

      <section className="marketplace-filters">
        <div className="filters-row">
          <div className="marketplace-filter-group">
            <label className="marketplace-filter-label">Search name or token</label>
            <input
              className="search-input"
              type="text"
              placeholder="Search DragN'Puff or #123"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="marketplace-filter-group">
            <label className="marketplace-filter-label">Rarity</label>
            <select
              className="marketplace-filter-select"
              value={filters.rarity}
              onChange={(e) => setFilters((prev) => ({ ...prev, rarity: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="legendary">Legendary</option>
              <option value="epic">Epic</option>
              <option value="rare">Rare</option>
              <option value="uncommon">Uncommon</option>
              <option value="common">Common</option>
            </select>
          </div>
          <div className="marketplace-filter-group">
            <label className="marketplace-filter-label">Sort</label>
            <select
              className="marketplace-filter-select"
              value={filters.sort}
              onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
            >
              <option value="rarity">Rarity first</option>
              <option value="id-desc">Token high to low</option>
              <option value="id-asc">Token low to high</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div className="filters-row">
          <div className="marketplace-filter-group">
            <label className="marketplace-filter-label">Trait type</label>
            <select
              className="marketplace-filter-select"
              value={filters.traitType}
              onChange={(e) => setFilters((prev) => ({ ...prev, traitType: e.target.value, traitValue: '' }))}
            >
              <option value="">Select trait</option>
              {Object.keys(traitOptions).map((trait) => (
                <option key={trait} value={trait}>{trait}</option>
              ))}
            </select>
          </div>
          <div className="marketplace-filter-group">
            <label className="marketplace-filter-label">Trait value</label>
            <select
              className="marketplace-filter-select"
              value={filters.traitValue}
              onChange={(e) => setFilters((prev) => ({ ...prev, traitValue: e.target.value }))}
              disabled={!filters.traitType}
            >
              <option value="">Select value</option>
              {filters.traitType && (traitOptions[filters.traitType] || []).map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
          <div className="marketplace-filter-group">
            <label className="marketplace-filter-label">&nbsp;</label>
            <button className="btn btn-secondary" onClick={addTraitFilter} disabled={!filters.traitType || !filters.traitValue}>
              Add trait filter
            </button>
          </div>
        </div>

        <div className="filters-row">
          <div className="marketplace-filter-group">
            <label className="marketplace-filter-label">Metadata window start</label>
            <input
              type="number"
              min="1"
              value={tokensWindow.start}
              onChange={(e) => handleWindowChange('start', e.target.value)}
            />
          </div>
          <div className="marketplace-filter-group">
            <label className="marketplace-filter-label">Count</label>
            <input
              type="number"
              min="1"
              max="50"
              value={tokensWindow.count}
              onChange={(e) => handleWindowChange('count', e.target.value)}
            />
          </div>
          <div className="marketplace-filter-group helper-text">
            Pulls metadata from {METADATA_BASE}/:id.json and estimates value by rarity.
          </div>
        </div>

        {filters.activeTraits.length > 0 && (
          <div className="active-traits">
            {filters.activeTraits.map((trait) => (
              <span key={`${trait.trait_type}-${trait.value}`} className="trait-chip">
                {trait.trait_type}: {trait.value}
                <button onClick={() => removeTraitFilter(trait.trait_type, trait.value)}>x</button>
              </span>
            ))}
          </div>
        )}

        <div className="rarity-legend">
          {rarityLegend.map((bucket) => (
            <span key={bucket.key} className="rarity-pill">
              {bucket.label}: {rarityBreakdown[bucket.key]}
            </span>
          ))}
        </div>
      </section>

      {error && <div className="marketplace-empty">{error}</div>}
      {loading && <div className="marketplace-loading">Loading metadata...</div>}

      {!loading && filteredNfts.length === 0 && (
        <div className="marketplace-empty">
          <div className="title">No dragons match this view</div>
          <div className="message">Adjust rarity or trait filters to explore more.</div>
        </div>
      )}

      <div className="marketplace-grid">
        {filteredNfts.map((nft) => (
          <NFTCard
            key={nft.tokenId}
            nft={nft}
            onBuy={() => {}}
            onBid={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default Trade;
