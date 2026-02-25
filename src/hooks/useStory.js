import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LZString from 'lz-string';
import { timelineData as defaultTimeline, letterContent as defaultLetter } from '../data';
import { supabase } from '../lib/supabaseClient';

// Fallback defaults
const defaultData = {
    partnerName: "",
    yourName: "",
    anniversary: "",
    letter: defaultLetter,
    timeline: defaultTimeline,
    passcode: "1402",
    vaultVideo: ""
};

// Minification mapping
const KEYS = {
    partnerName: 'p',
    yourName: 'y',
    anniversary: 'a',
    letter: 'l',
    timeline: 't',
    passcode: 'c',
    date: 'd',
    title: 'h',
    description: 'm',
    image: 'i',
    poeticSummary: 's',
    vaultVideo: 'v'
};

const compressData = (data) => {
    // Helper to minify keys
    const minify = (obj) => {
        if (!obj) return obj;
        if (Array.isArray(obj)) return obj.map(minify);

        const newObj = {};
        for (const k in obj) {
            const newKey = KEYS[k] || k;
            // Recursive minification for timeline objects
            if (typeof obj[k] === 'object' && obj[k] !== null) {
                newObj[newKey] = minify(obj[k]);
            } else {
                newObj[newKey] = obj[k];
            }
        }
        return newObj;
    };

    const minified = minify(data);
    const jsonString = JSON.stringify(minified);
    return LZString.compressToEncodedURIComponent(jsonString);
};

const decompressData = (str) => {
    if (!str) return null;
    try {
        const json = LZString.decompressFromEncodedURIComponent(str);
        if (!json) return null;

        const minified = JSON.parse(json);

        // Helper to restore keys
        const restore = (obj) => {
            if (!obj) return obj;
            if (Array.isArray(obj)) return obj.map(restore);

            const newObj = {};
            // Reverse mapping
            const REV_KEYS = Object.fromEntries(Object.entries(KEYS).map(([k, v]) => [v, k]));

            for (const k in obj) {
                const oldKey = REV_KEYS[k] || k;
                if (typeof obj[k] === 'object' && obj[k] !== null) {
                    newObj[oldKey] = restore(obj[k]);
                } else {
                    newObj[oldKey] = obj[k];
                }
            }
            return newObj;
        };

        // Check if data is already in legacy (long key) format
        if (minified.partnerName || minified.yourName) {
            return minified;
        }

        return restore(minified);
    } catch (e) {
        console.error("Decompress error", e);
        return null;
    }
};

export const useStory = () => {
    const [searchParams] = useSearchParams();
    const [fetchedData, setFetchedData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchById = async (id) => {
            setLoading(true);
            const { data, error } = await supabase
                .from('stories')
                .select('data')
                .eq('id', id)
                .single();

            if (data && data.data) {
                // Determine if data is compressed or raw JSON
                // Assuming we store new way as raw JSON or compressed?
                // Let's assume we store the raw JSON object for simplicity in DB
                setFetchedData(data.data);
            }
            setLoading(false);
        };

        const id = searchParams.get('id');
        if (id) {
            fetchById(id);
        }
    }, [searchParams]);

    const storyData = useMemo(() => {
        let parsed = null;

        // 1. Try fetched data (from Supabase via ?id=)
        if (fetchedData) {
            parsed = fetchedData;
            // Save data to localStorage
            try {
                localStorage.setItem('ourStory_data', JSON.stringify(parsed));
            } catch (e) { console.error(e); }
        }

        // Save ID to localStorage if present in URL
        const urlId = searchParams.get('id');
        if (urlId) {
            try {
                localStorage.setItem('ourStory_id', urlId);
            } catch (e) { console.error(e); }
        }

        // 2. Try URL parameters (legacy ?data=)
        const encodedData = searchParams.get('data');
        if (!parsed && encodedData) {
            parsed = decompressData(encodedData);
            if (parsed) {
                try {
                    localStorage.setItem('ourStory_data', JSON.stringify(parsed));
                } catch (e) { console.error(e); }
            }
        }

        // 3. Try LocalStorage
        if (!parsed) {
            try {
                const stored = localStorage.getItem('ourStory_data');
                if (stored) parsed = JSON.parse(stored);
            } catch (e) { console.error(e); }
        }

        // Retrieve ID from storage if not in URL
        let finalId = urlId;
        if (!finalId) {
            try {
                finalId = localStorage.getItem('ourStory_id');
            } catch (e) { console.error(e); }
        }

        if (!parsed) return defaultData;

        return {
            id: finalId, // Return the resolved ID
            partnerName: parsed.partnerName || defaultData.partnerName,
            yourName: parsed.yourName || defaultData.yourName,
            anniversary: parsed.anniversary || defaultData.anniversary,
            letter: parsed.letter || defaultData.letter,
            timeline: Array.isArray(parsed.timeline) && parsed.timeline.length > 0
                ? parsed.timeline
                : defaultData.timeline,
            passcode: parsed.passcode || defaultData.passcode,
            vaultVideo: parsed.vaultVideo || defaultData.vaultVideo
        };
    }, [searchParams, fetchedData]);

    return storyData;
};

// Modified: generateStoryLink is unchanged here (still uses compressed),
// but we will export a new function `generateShortLink` in CreateStory
// or we can export a simpler helper here.
export const generateCompressedData = (data) => {
    return compressData(data); // Returns string
};

export const generateStoryLink = (data) => {
    const compressed = compressData(data);
    const baseUrl = window.location.origin + '/';
    return `${baseUrl}?data=${compressed}`;
};
