
var htmldiff = require('./models/diff_google');


var left = `<p>MEMORANDUM OF UNDERSTANDING<sup><a href="#footnote-1" >[1]</a></sup></p><p>Ref. 20XX-XXXX</p><p>`;

var right = `<p>MEMORANDUM OF UNDERSTANDINGasdf<sup><a href="#footnote-1" id="footnote-ref-1">[1]</a></sup></p><p>Ref. 20XX-XXXX</p><p>`;

var dd = htmldiff.prototype.diff_main(left,right);

htmldiff.prototype.diff_cleanupEfficiency(dd);

console.log(htmldiff.prototype.diff_prettyHtml(dd));

// console.log(dd)