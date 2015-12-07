// phoneme.js
var fs = require('fs');
var path = require('path');

// Try to identify the correct phoneme to match a specific offset in the input word
const parseForPhonemeDef = function (input, offset, program)
{
    // Get the initial character to be examined
    var testChar = input[offset];
    var preTest = input.substr(0, offset);

    const matchingDefs = program.phnmDefs
        .filter(function (p) { return p.index[0] === testChar; })
        .filter(function (pc) {
            // Test the center context
            const pcc = pc.center;
            const pcl = pcc.length;
            return ((input.length - offset) > pcl) && pcc === input.substr(offset, pcl);
        })
        .filter(function (pr) {
            // Test the pre context
            const prx = new RegExp(pr.preRegex + "$");
            return prx.test(preTest);
        })
        .filter(function (po) {
            // Test the post context
            const pox = new RegExp("^" + po.postRegex);
            const postTest = input.substr(offset + po.center.length);
            return pox.test(postTest);
        });
    if (!matchingDefs) return undefined;
    
    //if (matchingDefs.length === 1)
    return matchingDefs[0];
}

function convertToPhoneme(program) {
    // Confirm there is something to do
    const txtToConvert = program.text.trim();
    if (!txtToConvert) {
        console.log("No text to convert");
        return undefined;
    } 

    // Ensure that the Rules have been applied to the Defs
    const isDefsPrepared = program.phnmDefs.some(function(def) {
        return def.preRegex || def.postRegex;
    });

    if (!isDefsPrepared) {
        // Reprocess the phoneme definitions to rebuild the index and the pre and post regex values
        // and clean everything else at the same time

        function getPhonemeFilterRule(ruleChar) {
            const rules = program.phnmRules.filter(function(rule) {
                return rule.context === ruleChar;
            });
            return rules.length === 0 ? ruleChar : rules[0].regex;
        }
    
        program.phnmDefs.map(function (def) {
            const c = def.center || "";
            const pre = def.pre || "";
            const post = def.post || "";

            def.center = c;
            def.translation = def.translation || "";
            def.pre = pre;
            def.post = post;
            def.index = c.substr(0, 1) + (9 - c.length) + (9 - pre.length) + (9 - post.length) + c;
            def.preRegex = pre.split("").map(getPhonemeFilterRule).join("");
            def.postRegex = post.split("").map(getPhonemeFilterRule).join("");

            return def;
        });
    }
    
    // Split the supplied text
    const words = txtToConvert.split(/\s+/).map(function (w) { return " " + w.toUpperCase() + " " });
    
    // Convert it to an array of phonemes
    program.phonemes = [].concat.apply([], words.map(function(w, index) {
        const phnms = [];

        if (index) {
            // Invoke a special phoneme rule to insert an or bar '|' as a word divider
            phnms.push(parseForPhonemeDef("   ", 1, program));
        }

        // ReSharper disable once VariableCanBeMadeLet
        for (var ix = 1; ix < w.length - 1; ix++) {
            // ReSharper disable once VariableCanBeMadeConst
            var phoneme = parseForPhonemeDef(w, ix, program);
            if (!!phoneme) {
                phnms.push(phoneme);
                ix += phoneme.center.length - 1;
            }
        }

        return phnms;
    }));
    
    // Return the whole thing
    return program;
}

exports.toPhoneme = convertToPhoneme;