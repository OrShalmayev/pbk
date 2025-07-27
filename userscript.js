// ==UserScript==  // These comments are often ignored by DevTools, but kept for reference
// @name         Fetch and Run Funny Script from GitHub using Cache (DevTools)
// @namespace    http://your-namespace/ // Not typically used in DevTools manifest
// @version      0.1
// @description  Block ads on YouTube and your favorite sites for free
// @author       You
// @match        http://*/*
// @match        https://*/*
// @grant        none // No special grants, using standard web APIs
// ==/UserScript==

(function () {
    'use strict';

    const url = "https://raw.githubusercontent.com/OrShalmayev/temper-monkey/main/funny.js"; // Removed trailing spaces
    const storageKey = 'githubFunnyScript';
    const storageTimestampKey = 'githubScriptTimestamp';
    // Note: Changed to 1 hour = 60 minutes * 60 seconds * 1000 ms
    const oneHour = 60 * 60 * 1000; // in milliseconds

    // --- Functions using standard Web APIs ---
    const getCachedData = () => {
        try {
            const script = localStorage.getItem(storageKey);
            const timestamp = localStorage.getItem(storageTimestampKey);
            return { script, timestamp: timestamp ? parseInt(timestamp, 10) : 0 };
        } catch (e) {
            console.error("Error reading from localStorage:", e);
            return { script: null, timestamp: 0 };
        }
    };

    const setCachedData = (script) => {
        try {
            localStorage.setItem(storageKey, script);
            localStorage.setItem(storageTimestampKey, Date.now().toString());
        } catch (e) {
            console.error("Error writing to localStorage:", e);
            // Handle storage full or other errors if needed
        }
    };

    const fetchScript = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const scriptText = await response.text();
            return scriptText;
        } catch (error) {
            console.error(`Failed to fetch script from ${url}:`, error);
            return null; // Indicate failure
        }
    };

    const runScript = (scriptText) => {
        if (typeof scriptText === 'string' && scriptText.length > 0) {
            try {
                // SECURITY WARNING: Executing code from an external source.
                // Only do this if you trust the source completely.
                // eval(scriptText);
                // Alternative (also carries risk):
                const scriptFunction = new Function(scriptText);
                scriptFunction();
                console.log("External script executed.");
            } catch (e) {
                console.error("Error executing fetched script:", e);
            }
        } else {
            console.warn("Attempted to run empty or invalid script.");
        }
    };

    // --- Main Logic ---
    const { script: cachedScript, timestamp: cachedTimestamp } = getCachedData();
    const now = Date.now();
    const timeSinceLastFetch = now - cachedTimestamp;

    if (timeSinceLastFetch > oneHour || !cachedScript) {
        console.log("Fetching script from GitHub...");
        fetchScript(url).then(fetchedScript => {
            if (fetchedScript !== null) {
                setCachedData(fetchedScript);
                runScript(fetchedScript);
            } else {
                // If fetch fails but we have a cached version, try running that
                if (cachedScript) {
                    console.warn("Fetch failed, attempting to run cached script.");
                    runScript(cachedScript);
                } else {
                    console.error("Failed to fetch script and no cache available.");
                }
            }
        }).catch(error => {
            console.error("Unhandled error during fetch:", error);
            // If fetch fails but we have a cached version, try running that
            if (cachedScript) {
                console.warn("Unhandled error, attempting to run cached script.");
                runScript(cachedScript);
            }
        });
    } else {
        console.log("Using cached script.");
        runScript(cachedScript);
    }

})(); // Immediately Invoked Function Expression (IIFE)