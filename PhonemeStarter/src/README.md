PhonemeJS
==========

A simple Text to Phoneme library.

PhonemeJS supports any locale, accent, or language you want.  All you need to do is craft up a phoneme definitions list, and a supporting set of phoneme rules.
PhonemeJS comes with some sample rules for English (UK and US).  You can either modify these or create your own.

PhonemeJS only translates individual words.  
The sample rules included only 'recognise' alphabetic characters and the apostrophe.  They specifically do not 'recognise' numbers or other special characters.
To get PhonemeJS to work with numbers, etc. it is strongly recommended that any non-alphabetic characters to be recognised are converted to actual text first before being presented to the PhonemeJS library.  

For example, the number 1,234 could be translated to:

* "One thousand, two hundred, thirty four" for en-us, 
* "One thousand, two hundred and thirty four" for en-gb, en-au and en-nz (and probably others), 

or if it's actually common continental European representation (but translated to English text) it could be

* "One point two three four".

A phoneme definition is structured as follows:

* `Index`: A value calculated from the Center, Pre and Post context values that can be used for sorting and querying.  
It is supplied in the sample phoneme definition files, but it is not actually required.
* `Center`: The primary context value that is matched against the supplied text.
* `Pre`: A further filter that is used to restrict the set of phoneme definitions.  It is applied to the text 'before' the center.
* `Post`: A final filter used to restrict the set of phoneme definitions.  It is applied to the text 'after' the center.
* `Translation`: The set of phonemes that will be returned if the match is successful.
* `PreRegex`: The Pre filter translated into an actual regex match.
* `PostRegex`: The Post filter translated into an actual regex match.

Index, PreRegex and PostRegex are rebuilt every time the phoneme definitions are reloaded.

The Center filter is a literal character match.

The Pre and Post filters can specify a combination of literal character matches and special match characters.  
The special match characters are identified by their addition in the phoneme rules definitions.  
Any character present in the Pre and Post filters that does not have a corresponding match in the phoneme rules is treated as a literal.

A phoneme rule definition is structured as follows:

* `Context`: A single character that identifies a special matching rule.  The Pre or Post context rules may specify this character to include the Regex in their corresponding PreRegex of PostRegex members. 
* `Title`: A text description of the special matching rule.
* `Not`: A boolean - intended for future purposes, to indicate that the following special character or literal must not be found.
* `Tokens`: A set of space delimited tokens - intended for future purposes, to further qualify the behaviour of "Not".
* `Regex`: The implementation of the Context as a Regular Expression match.

*Important:* Do NOT include any Regular Expression Anchor clauses in the phoneme rule Regex member.  
PhonemeJS uses Anchors itself to ensure correct application of the PreRegex and PostRegex filters.

Example:
Assuming the following phoneme rules:
```
{ "context": "!", "title": "Non Alphabetic", "regex": "[^A-Z]" },
{ "context": "#", "title": "Vowel Sequence", "regex": "[AEIOU]+" },
{ "context": "^", "title": "Consonant", "regex": "[BCDFGHJKLMNPQRSTVWXZ]" },
{ "context": ":", "title": "Consonant Sequence", "regex": "[BCDFGHJKLMNPQRSTVWXZ]+" },
{ "context": "$", "title": "Word Ending", "regex": "(ING|ELY|ED|ER|ES|E)" },'
```
And the following phoneme definitions:
```
{ "index": "A677ABL", "pre": "EN", "center": "ABL", "post": "$!", "translation": "a ie b lf" },
{ "index": "E878E", "pre": "#:", "center": "E", "post": "!", "translation": "" },
{ "index": "E899E", "pre": "", "center": "E", "post": "", "translation": "eh" },
{ "index": "N899N", "pre": "", "center": "N", "post": "", "translation": "n" },
```
The word "enable" would end up broken into the following parts:
`e n abl e`

And rendered into the following phonemes:
`eh n a ie b lf`
