// phoneme.js
var fs = require('fs');
var path = require('path');

function convertToPhoneme(program) {
    // Confirm there is something to do
    var txtToConvert = program.text.trim();
    if (!txtToConvert) {
        console.log("No text to convert");
        return undefined;
    } else {
        //console.log("Converting: '" + txtToConvert + "'");
    }
    
    //console.log("Locale: '" + program.locale + "'");

    // Ensure that the Rules have been applied to the Defs
    var isDefsPrepared = program.phnmDefs.some(function(def) {
        return def.preRegex || def.postRegex;
    });
    
    function getPhonemeFilterRule(ruleChar) {
        var rules = program.phnmRules.filter(function(rule) {
            return rule.context === ruleChar;
        });

        return rules.length === 0 ? ruleChar : rules[0].regex;
    }
    
    if (!isDefsPrepared) {
        // Reprocess the phoneme definitions to rebuild the index and the pre and post regex values
        // and clean everything else at the same time
        program.phnmDefs.map(function (def) {
            var c = def.center || "";
            var pre = def.pre || "";
            var post = def.post || "";

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

    var words = txtToConvert.split(/\s+/).map(function (w) { return " " + w.toUpperCase() + " " });

    //console.log("Words: " + words);

    function parseForPhonemeDef(input, offset)
    {
        // Get the initial character to be examined
        var testChar = input[offset];
        var preTest = input.substr(0, offset);
        
        var matchingDefs = program.phnmDefs
            .filter(function(p) { return p.index[0] === testChar; })
            .filter(function(pc) {
                // Test the center context
                var pcc = pc.center;
                var pcl = pcc.length;
                return ((input.length - offset) > pcl) && pcc === input.substr(offset, pcl);
            })
            .filter(function(pr) {
                // Test the pre context
                var prx = new RegExp(pr.preRegex + "$");
                return prx.test(preTest);
            })
            .filter(function(po) {
                // Test the post context
                var pox = new RegExp("^" + po.postRegex);
                var postTest = input.substr(offset + po.center.length);
                return pox.test(postTest);
            });
        
        if (!matchingDefs) return undefined;

        //if (matchingDefs.length === 1)
            return matchingDefs[0];
    }
    

    program.phonemes = [].concat.apply([], words.map(function(w, index) {
        var phnms = [];
        if (index) {
            // Invoke a special phoneme rule to insert an or bar '|' as a word divider
            phnms.push(parseForPhonemeDef("   ", 1));
        }
        for (var ix = 1; ix < w.length - 1; ix++) {
            var phoneme = parseForPhonemeDef(w, ix);
            if (!!phoneme) {
                phnms.push(phoneme);
                ix += phoneme.center.length - 1;
            }
        }

        return phnms;
    }));

    return program;
}

exports.toPhoneme = convertToPhoneme;