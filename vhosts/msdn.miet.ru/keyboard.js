// ==UserScript==
// @name          Virtual Keyboard Interface
// @author        GreyWyvern 
// @namespace     http://www.greywyvern.com/
// @version       1.17
// @description   Adds a virtual keyboard to text fields, password fields and textareas allowing keyboardless input of text and special characters.  Install the script and double-click on one of the form element types above to display the keyboard.
// @ujs:category  item: enhancements
// @ujs:published 2007-07-23
// @ujs:modified  2009-01-23
// @ujs:documentation http://www.greywyvern.com/code/js/keyboard.html
// @ujs:download http://www.greywyvern.com/code/js/keyboard.userjs.js
// ==/UserScript==

/* ********************************************************************
 **********************************************************************
 * HTML Virtual Keyboard Interface User Javascript - v1.17
 *   Copyright (c) 2009 - GreyWyvern
 *
 *  - Licenced for free distribution under the BSDL
 *          http://www.opensource.org/licenses/bsd-license.php
 *
 * Add a script-driven keyboard interface to text fields, password
 * fields and textareas automatically in Opera and Firefox.  Double
 * click any of these types of fields to display the keyboard.
 *
 * See http://www.greywyvern.com/code/js/keyboard.html for examples and
 * usage instructions.
 *
 * Version 1.17 - January 23, 2009
 *   - Changed root ID to prevent static/userscript CSS conflicts
 *   - Corrected some hover state CSS quirks
 *
 * Version 1.16 - January 20, 2009
 *   - Add option to clear password inputs on focus
 *   - Add option to prevent display of the version number
 *
 * Version 1.15 - January 15, 2009
 *   - Fix virtual keyboard edit of readonly inputs in Safari/Chrome
 *   - Add some "basic" styles to prevent document CSS seepage
 *
 * Version 1.14 - January 14, 2009
 *   - More fixes for IE readonly input cases (Nuno Pereira)
 *   - Setting dead keys to On by default now works in IE
 *   - Various IE fixes to prevent unwanted cursor movement
 *   - Fixed "Illegal value" error in Firefox
 *   - Moved "Dead keys: On/Off" text to title of checkbox
 *
 * Version 1.13 - January 13, 2009
 *   - Fix virtual keyboard edit of readonly inputs in IE
 *   - Czech keyboard layout added
 *
 * Version 1.12 - December 16, 2008
 *   - Farsi (Persian) keyboard layout added
 *   - Ensure keyboard is displayed in a LtR format (Kaveh Bakhtiyari)
 *   - Changed default keyboard to US Int'l
 *
 * Version 1.11 - July 18, 2008
 *   - Position:fixed tweaks for browser updates since first release
 *   - Fix for IE6 bug with covering select elements
 *   - Burmese keyboard layout added
 *
 * Version 1.10 - April 14, 2008
 *   - Slovenian keyboard layout added
 *
 * Version 1.9 - April 3, 2008
 *   - Hungarian keyboard layout added
 *
 * Version 1.8 - March 31, 2008
 *   - Performance tweaks
 *
 * Version 1.7 - March 27, 2008
 *   - Arabic keyboard layout added
 *
 * Version 1.6 - January 16, 2008
 *   - Hebrew keyboard layout added
 *
 * Version 1.5 - January 7, 2008
 *   - Italian and Spanish (Spain) keyboard layouts added
 *
 * Version 1.4a - October 15, 2007
 *   - Keyboard is fully removed from document when hidden
 *
 * Version 1.4 - August 1, 2007
 *   - Simplified layout syntax a bit
 *   - Added version number to lower right of interface
 *   - Various other small bug fixes
 *
 * Version 1.3 - July 30, 2007
 *   - Interaction styling changes (Alt, AltGr, Shift)
 *   - Justified keys - last key expands to fit width
 *   - If no dead keys in layout, dead key checkbox is hidden
 *   - Option to disable dead keys per keyboard
 *   - Added the Number Pad layout
 *   - Pulled all variations of script up to same version number
 *
 * Keyboard Credits
 *   - Czech keyboard layout by Nusret Vardarman
 *   - Farsi (Persian) keyboard layout by Kaveh Bakhtiyari (www.bakhtiyari.com)
 *   - Burmese keyboard layout by Cetanapa
 *   - Slovenian keyboard layout by Miran Zeljko
 *   - Hungarian keyboard layout by Antal Sall 'Hiromacu'
 *   - Arabic keyboard layout by Srinivas Reddy
 *   - Italian and Spanish (Spain) keyboard layouts by dictionarist.com
 *   - Lithuanian and Russian keyboard layouts by Ramunas
 *   - German keyboard layout by QuHno
 *   - French keyboard layout by Hidden Evil
 *   - Polish Programmers layout by moose
 *   - Turkish keyboard layouts by offcu
 *   - Dutch and US Int'l keyboard layouts by jerone
 *   - Portuguese keyboard layout by clisboa
 *
 */
window.addEventListener('load', function() {
  function VKI_buildKeyboardInputs() {
    var self = this;

    this.VKI_version = "1.17";
    this.VKI_target = this.VKI_visible = "";
    this.VKI_shift = this.VKI_capslock = this.VKI_alternate = this.VKI_dead = false;
    this.VKI_deadkeysOn = false;
    this.VKI_kt = "English";  // Default keyboard layout
    this.VKI_clearPasswords = false;  // Clear password fields on focus
    this.VKI_showVersion = false;
    this.VKI_keyCenter = 3;
    this.VKI_isIE = /*@cc_on!@*/false;
    this.VKI_isIE6 = /*@if(@_jscript_version == 5.6)!@end@*/false;
    this.VKI_isMoz = (navigator.product == "Gecko");
    this.VKI_isWebKit = RegExp("KHTML").test(navigator.userAgent);


    /* ***** Create keyboards **************************************** */
    this.VKI_layout = new Object();
    this.VKI_layoutDDK = new Object();

    // - Lay out each keyboard in rows of sub-arrays.  Each sub-array
    //   represents one key.
    // 
    // - Each sub-array consists of four slots described as follows:
    //     example: ["a", "A", "\u00e1", "\u00c1"]
    //
    //          a) Normal character
    //          A) Character + Shift or Caps
    //     \u00e1) Character + Alt or AltGr
    //     \u00c1) Character + Shift or Caps + Alt or AltGr
    //
    //   You may include sub-arrays which are fewer than four slots.  In
    //   these cases, the missing slots will be blanked when the
    //   corresponding modifier key (Shift or AltGr) is pressed.
    //
    // - If the second slot of a sub-array matches one of the following
    //   strings:
    //       "Tab", "Caps", "Shift", "Enter", "Bksp", "Alt" OR "AltGr"
    //   then the function of the key will be the following,
    //   respectively:
    //     - Insert a tab
    //     - Toggle Caps Lock (technically a Shift Lock)
    //     - Next entered character will be the shifted character
    //     - Insert a newline (textarea), or close the keyboard
    //     - Delete the previous character
    //     - Next entered character will be the alternate character
    //
    //   The first slot of this sub-array will be the text to display on
    //   the corresponding key.  This allows for easy localisation of key
    //   names.
    //
    // - Layout dead keys (diacritic + letter) should be added as arrays
    //   of two item arrays with hash keys equal to the diacritic.  See
    //   the "this.VKI_deadkey" object below the layout definitions. In
    //   each two item child array, the second item is what the diacritic
    //   would change the first item to.
    //
    // - To disable dead keys for a layout, simply assign true to the
    //   this.VKI_layoutDDK (DDK = disable dead keys) object of the same
    //   name as the layout.  See the Numpad layout below for an example.
    //
    // - Note that any characters beyond the normal ASCII set should be
    //   entered in escaped Unicode format.  (eg \u00a3 = Pound symbol)
    //   You can find Unicode values for characters here:
    //     http://unicode.org/charts/
    //
    // - To remove a keyboard, just delete it, or comment it out of the
    //   source code
    this.VKI_layout.Русский = [ // Russian Standard Keyboard
      [["\u0451", "\u0401"], ["1", "!"], ["2", '"'], ["3", "\u2116"], ["4", ";"], ["5", "%"], ["6", ":"], ["7", "?"], ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+"], ["Bksp", "Bksp"]],
      [["Tab", "Tab"], ["\u0439", "\u0419"], ["\u0446", "\u0426"], ["\u0443", "\u0423"], ["\u043A", "\u041A"], ["\u0435", "\u0415"], ["\u043D", "\u041D"], ["\u0433", "\u0413"], ["\u0448", "\u0428"], ["\u0449", "\u0429"], ["\u0437", "\u0417"], ["\u0445", "\u0425"], ["\u044A", "\u042A"], ["Enter", "Enter"]],
      [["Caps", "Caps"], ["\u0444", "\u0424"], ["\u044B", "\u042B"], ["\u0432", "\u0412"], ["\u0430", "\u0410"], ["\u043F", "\u041F"], ["\u0440", "\u0420"], ["\u043E", "\u041E"], ["\u043B", "\u041B"], ["\u0434", "\u0414"], ["\u0436", "\u0416"], ["\u044D", "\u042D"], ["\\", "/"]],
      [["Shift", "Shift"], ["/", "|"], ["\u044F", "\u042F"], ["\u0447", "\u0427"], ["\u0441", "\u0421"], ["\u043C", "\u041C"], ["\u0438", "\u0418"], ["\u0442", "\u0422"], ["\u044C", "\u042C"], ["\u0431", "\u0411"], ["\u044E", "\u042E"], [".", ","], ["Shift", "Shift"]],
      [[" ", " "]]
    ];
    
    this.VKI_layout["English"] = [ // US International Keyboard
      [["`", "~"], ["1", "!", "\u00a1", "\u00b9"], ["2", "@", "\u00b2"], ["3", "#", "\u00b3"], ["4", "$", "\u00a4", "\u00a3"], ["5", "%", "\u20ac"], ["6", "^", "\u00bc"], ["7", "&", "\u00bd"], ["8", "*", "\u00be"], ["9", "(", "\u2018"], ["0", ")", "\u2019"], ["-", "_", "\u00a5"], ["=", "+", "\u00d7", "\u00f7"], ["Bksp", "Bksp"]],
      [["Tab", "Tab"], ["q", "Q", "\u00e4", "\u00c4"], ["w", "W", "\u00e5", "\u00c5"], ["e", "E", "\u00e9", "\u00c9"], ["r", "R", "\u00ae"], ["t", "T", "\u00fe", "\u00de"], ["y", "Y", "\u00fc", "\u00dc"], ["u", "U", "\u00fa", "\u00da"], ["i", "I", "\u00ed", "\u00cd"], ["o", "O", "\u00f3", "\u00d3"], ["p", "P", "\u00f6", "\u00d6"], ["[", "{", "\u00ab"], ["]", "}", "\u00bb"], ["\\", "|", "\u00ac", "\u00a6"]],
      [["Caps", "Caps"], ["a", "A", "\u00e1", "\u00c1"], ["s", "S", "\u00df", "\u00a7"], ["d", "D", "\u00f0", "\u00d0"], ["f", "F"], ["g", "G"], ["h", "H"], ["j", "J"], ["k", "K"], ["l", "L", "\u00f8", "\u00d8"], [";", ":", "\u00b6", "\u00b0"], ["'", '"', "\u00b4", "\u00a8"], ["Enter", "Enter"]],
      [["Shift", "Shift"], ["z", "Z", "\u00e6", "\u00c6"], ["x", "X"], ["c", "C", "\u00a9", "\u00a2"], ["v", "V"], ["b", "B"], ["n", "N", "\u00f1", "\u00d1"], ["m", "M", "\u00b5"], [",", "<", "\u00e7", "\u00c7"], [".", ">"], ["/", "?", "\u00bf"], ["Shift", "Shift"]],
      [[" ", " ", " ", " "]/*, ["Alt", "Alt"]*/]
    ];


    /* ***** Define Dead Keys **************************************** */
    this.VKI_deadkey = new Object();

    // - Lay out each dead key set in one row of sub-arrays.  The rows
    //   below are wrapped so uppercase letters are below their lowercase
    //   equivalents.
    //
    // - The first letter in each sub-array is the letter pressed after
    //   the diacritic.  The second letter is the letter this key-combo
    //   will generate.
    //
    // - Note that if you have created a new keyboard layout and want it
    //   included in the distributed script, PLEASE TELL ME if you have
    //   added additional dead keys to the ones below.

    this.VKI_deadkey['"'] = this.VKI_deadkey['\u00a8'] = [ // Umlaut / Diaeresis / Greek Dialytika
      ["a", "\u00e4"], ["e", "\u00eb"], ["i", "\u00ef"], ["o", "\u00f6"], ["u", "\u00fc"], ["y", "\u00ff"], ["\u03b9", "\u03ca"], ["\u03c5", "\u03cb"],
      ["A", "\u00c4"], ["E", "\u00cb"], ["I", "\u00cf"], ["O", "\u00d6"], ["U", "\u00dc"], ["Y", "\u0178"], ["\u0399", "\u03aa"], ["\u03a5", "\u03ab"]
    ];
    this.VKI_deadkey['~'] = [ // Tilde
      ["a", "\u00e3"], ["o", "\u00f5"], ["n", "\u00f1"],
      ["A", "\u00c3"], ["O", "\u00d5"], ["N", "\u00d1"]
    ];
    this.VKI_deadkey['^'] = [ // Circumflex
      ["a", "\u00e2"], ["e", "\u00ea"], ["i", "\u00ee"], ["o", "\u00f4"], ["u", "\u00fb"], ["w", "\u0175"], ["y", "\u0177"],
      ["A", "\u00c2"], ["E", "\u00ca"], ["I", "\u00ce"], ["O", "\u00d4"], ["U", "\u00db"], ["W", "\u0174"], ["Y", "\u0176"]
    ];
    this.VKI_deadkey['\u02c7'] = [ // Baltic caron
      ["c", "\u010D"], ["s", "\u0161"], ["z", "\u017E"], ["r", "\u0159"], ["d", "\u010f"], ["t", "\u0165"], ["n", "\u0148"], ["l", "\u013e"], ["e", "\u011b"],
      ["C", "\u010C"], ["S", "\u0160"], ["Z", "\u017D"], ["R", "\u0158"], ["D", "\u010e"], ["T", "\u0164"], ["N", "\u0147"], ["L", "\u013d"], ["E", "\u011a"]
    ];
    this.VKI_deadkey['\u02d8'] = [ // Romanian and Turkish breve
      ["a", "\u0103"], ["g", "\u011f"],
      ["A", "\u0102"], ["G", "\u011e"]
    ];
    this.VKI_deadkey['`'] = [ // Grave
      ["a", "\u00e0"], ["e", "\u00e8"], ["i", "\u00ec"], ["o", "\u00f2"], ["u", "\u00f9"],
      ["A", "\u00c0"], ["E", "\u00c8"], ["I", "\u00cc"], ["O", "\u00d2"], ["U", "\u00d9"]
    ];
    this.VKI_deadkey["'"] = this.VKI_deadkey['\u00b4'] = this.VKI_deadkey['\u0384'] = [ // Acute / Greek Tonos
      ["a", "\u00e1"], ["e", "\u00e9"], ["i", "\u00ed"], ["o", "\u00f3"], ["u", "\u00fa"], ["y", "\u00fd"], ["\u03b1", "\u03ac"], ["\u03b5", "\u03ad"], ["\u03b7", "\u03ae"], ["\u03b9", "\u03af"], ["\u03bf", "\u03cc"], ["\u03c5", "\u03cd"], ["\u03c9", "\u03ce"],
      ["A", "\u00c1"], ["E", "\u00c9"], ["I", "\u00cd"], ["O", "\u00d3"], ["U", "\u00da"], ["Y", "\u00dd"], ["\u0391", "\u0386"], ["\u0395", "\u0388"], ["\u0397", "\u0389"], ["\u0399", "\u038a"], ["\u039f", "\u038c"], ["\u03a5", "\u038e"], ["\u03a9", "\u038f"]
    ];
    this.VKI_deadkey['\u02dd'] = [ // Hungarian Double Acute Accent
      ["o", "\u0151"], ["u", "\u0171"],
      ["O", "\u0150"], ["U", "\u0170"]
    ];
    this.VKI_deadkey["\u0385"] = [ // Greek Dialytika + Tonos
      ["\u03b9", "\u0390"], ["\u03c5", "\u03b0"]
    ];
    this.VKI_deadkey['\u00b0'] = this.VKI_deadkey['\u00ba'] = [ // Ring
      ["a", "\u00e5"], ["u", "\u016f"],
      ["A", "\u00c5"], ["U", "\u016e"]
    ];



    /* ***** Find tagged input & textarea elements ******************* */
    var inputElems = [
      document.getElementsByTagName('input'),
      document.getElementsByTagName('textarea'),
    ]
    for (var x = 0, inputCount = 0, elem; elem = inputElems[x++];) {
      if (elem) {
        for (var y = 0, keyid = "", ex; ex = elem[y++];) {
          if (ex.nodeName == "TEXTAREA" || ex.type == "text" || ex.type == "password") {
            if (!ex.id) {
              do { keyid = 'keyboardInputInitiator' + inputCount++; } while (document.getElementById(keyid));
              ex.id = keyid;
            } else keyid = ex.id;
            ex.addEventListener('blur', (function(a) { return function() { self.VKI_close(); }; })(keyid), false);
            ex.addEventListener('click', (function(a) { return function() { self.VKI_show(a); }; })(keyid), false);
            if (this.VKI_isIE) {
              ex.onclick = ex.onselect = ex.onkeyup = function(e) {
                if ((e || event).type != "keyup" || !this.readOnly)
                  this.range = document.selection.createRange();
              };
            }
          }
        }
      }
    }


    /* ***** Build the keyboard interface **************************** */
    this.VKI_keyboard = document.createElement('table');
    this.VKI_keyboard.id = "keyboardInputMasterUserScript";
    this.VKI_keyboard.dir = "ltr";
    this.VKI_keyboard.cellSpacing = this.VKI_keyboard.border = "0";

    var thead = document.createElement('thead');
      var tr = document.createElement('tr');
        var th = document.createElement('th');
          var kblist = document.createElement('select');
            for (ktype in this.VKI_layout) {
              if (typeof this.VKI_layout[ktype] == "object") {
                var opt = document.createElement('option');
                    opt.value = ktype;
                    opt.appendChild(document.createTextNode(ktype));
                  kblist.appendChild(opt);
              }
            }
            if (kblist.options.length) {
                kblist.value = this.VKI_kt;
                kblist.addEventListener('change', function() {
                  self.VKI_kt = this.value;
                  self.VKI_buildKeys();
                  self.VKI_position();
                }, false);
              th.appendChild(kblist);
            }

            var label = document.createElement('label');
              var checkbox = document.createElement('input');
                  checkbox.type = "checkbox";
                  checkbox.title = "Dead keys: " + ((this.checked) ? "On" : "Off");
                  checkbox.defaultChecked = this.VKI_deadkeysOn;
                  checkbox.addEventListener('click', function() {
                    self.VKI_deadkeysOn = this.checked;
                    this.title = "Dead keys: " + ((this.checked) ? "On" : "Off");
                    self.VKI_modify("");
                    return true;
                  }, false);
                label.appendChild(checkbox);
                  checkbox.checked = this.VKI_deadkeysOn;
            th.appendChild(label);
          tr.appendChild(th);

        var td = document.createElement('td');
          var clearer = document.createElement('span');
              clearer.id = "keyboardInputClear";
              clearer.appendChild(document.createTextNode("Очистить"));
              clearer.title = "Clear this input";
              clearer.addEventListener('mousedown', function() { this.className = "pressed"; }, false);
              clearer.addEventListener('mouseup', function() { this.className = ""; }, false);
              clearer.addEventListener('click', function() {
                self.VKI_target.value = "";
                self.VKI_target.focus();
                return false;
              }, false);
            td.appendChild(clearer);

          var closer = document.createElement('span');
              closer.id = "keyboardInputClose";
              closer.appendChild(document.createTextNode(" X "));
              closer.title = "Close this window";
              closer.addEventListener('mousedown', function() { this.className = "pressed"; }, false);
              closer.addEventListener('mouseup', function() { this.className = ""; }, false);
              closer.addEventListener('click', function() { self.VKI_close(); }, false);
            td.appendChild(closer);

          tr.appendChild(td);
        thead.appendChild(tr);
    this.VKI_keyboard.appendChild(thead);

    var tbody = document.createElement('tbody');
      var tr = document.createElement('tr');
        var td = document.createElement('td');
            td.colSpan = "2";
          var div = document.createElement('div');
              div.id = "keyboardInputLayout";
            td.appendChild(div);
          if (this.VKI_showVersion) {
            var div = document.createElement('div');
              var ver = document.createElement('var');
                  ver.appendChild(document.createTextNode("v" + this.VKI_version));
                div.appendChild(ver);
              td.appendChild(div);
          }
          tr.appendChild(td);
        tbody.appendChild(tr);
    this.VKI_keyboard.appendChild(tbody);      

    if (this.VKI_isIE6) {
      this.VKI_iframe = document.createElement('iframe');
      this.VKI_iframe.style.position = "absolute";
      this.VKI_iframe.style.border = "0px none";
      this.VKI_iframe.style.filter = "mask()";
      this.VKI_iframe.style.zIndex = "999999";
    }


    /* ***** Functions ************************************************ */
    /* ******************************************************************
     * Build or rebuild the keyboard keys
     *
     */
    this.VKI_buildKeys = function() {
      this.VKI_shift = this.VKI_capslock = this.VKI_alternate = this.VKI_dead = false;
      this.VKI_deadkeysOn = (this.VKI_layoutDDK[this.VKI_kt]) ? false : this.VKI_keyboard.getElementsByTagName('label')[0].getElementsByTagName('input')[0].checked;

      var container = this.VKI_keyboard.tBodies[0].getElementsByTagName('div')[0];
      while (container.firstChild) container.removeChild(container.firstChild);

      for (var x = 0, hasDeadKey = false, lyt; lyt = this.VKI_layout[this.VKI_kt][x++];) {
        var table = document.createElement('table');
            table.border = table.cellSpacing = "1";
        if (lyt.length <= this.VKI_keyCenter) table.className = "keyboardInputCenter";
          var tbody = document.createElement('tbody');
            var tr = document.createElement('tr');
            for (var y = 0, lkey; lkey = lyt[y++];) {
              var td = document.createElement('td');
                  td.appendChild(document.createTextNode(lkey[0]));

                var className = [];
                if (this.VKI_deadkeysOn)
                  for (key in this.VKI_deadkey)
                    if (key === lkey[0]) { className.push("alive"); break; }
                if (lyt.length > this.VKI_keyCenter && y == lyt.length) className.push("last");
                if (lkey[0] == " ") className.push("space");
                  td.className = className.join(" ");

                  td.addEventListener('mouseover', function() { if (this.firstChild.nodeValue != "\xa0") this.className += " hover"; }, false);
                  td.addEventListener('mouseout', function() { this.className = this.className.replace(/ ?(hover|pressed)/g, ""); }, false);
                  td.addEventListener('mousedown', function() { if (this.firstChild.nodeValue != "\xa0") this.className += " pressed"; }, false);
                  td.addEventListener('mouseup', function() { this.className = this.className.replace(/ ?pressed/g, ""); }, false);
                  td.addEventListener('click', function() { return false; }, false);

                switch (lkey[1]) {
                  case "Caps":
                  case "Shift":
                  case "Alt":
                  case "AltGr":
                    td.addEventListener('click', (function(type) { return function() { self.VKI_modify(type); return false; }})(lkey[1]), false);
                    break;
                  case "Tab":
                    td.addEventListener('click', function() { self.VKI_insert("\t"); return false; }, false);
                    break;
                  case "Bksp":
                    td.addEventListener('click', function() {
                      self.VKI_target.focus();
                      if (self.VKI_target.setSelectionRange) {
                        if (self.VKI_target.readOnly && self.VKI_isWebKit) {
                          var rng = [self.VKI_target.selStart || 0, self.VKI_target.selEnd || 0];
                        } else var rng = [self.VKI_target.selectionStart, self.VKI_target.selectionEnd];
                        if (rng[0] < rng[1]) rng[0]++;
                        self.VKI_target.value = self.VKI_target.value.substr(0, rng[0] - 1) + self.VKI_target.value.substr(rng[1]);
                        self.VKI_target.setSelectionRange(rng[0] - 1, rng[0] - 1);
                        if (self.VKI_target.readOnly && self.VKI_isWebKit) {
                          var range = window.getSelection().getRangeAt(0);
                          self.VKI_target.selStart = range.startOffset;
                          self.VKI_target.selEnd = range.endOffset;
                        }
                      } else if (self.VKI_target.createTextRange) {
                        try { 
                          self.VKI_target.range.select();
                        } catch(e) { self.VKI_target.range = document.selection.createRange(); }
                        if (!self.VKI_target.range.text.length) self.VKI_target.range.moveStart('character', -1);
                        self.VKI_target.range.text = "";
                      } else self.VKI_target.value = self.VKI_target.value.substr(0, self.VKI_target.value.length - 1);
                      if (self.VKI_shift) self.VKI_modify("Shift");
                      if (self.VKI_alternate) self.VKI_modify("AltGr");
                      self.VKI_target.focus();
                      return true;
                    }, false);
                    break;
                  case "Enter":
                    td.addEventListener('click', function() {
                      if (self.VKI_target.nodeName != "TEXTAREA") {
                        self.VKI_close();
                        this.className = this.className.replace(/ ?(hover|pressed)/g, "");
                      } else self.VKI_insert("\n");
                      return true;
                    }, false);
                    break;
                  default:
                    td.addEventListener('click', function() {
                      if (self.VKI_deadkeysOn && self.VKI_dead) {
                        if (self.VKI_dead != this.firstChild.nodeValue) {
                          for (key in self.VKI_deadkey) {
                            if (key == self.VKI_dead) {
                              if (this.firstChild.nodeValue != " ") {
                                for (var z = 0, rezzed = false, dk; dk = self.VKI_deadkey[key][z++];) {
                                  if (dk[0] == this.firstChild.nodeValue) {
                                    self.VKI_insert(dk[1]);
                                    rezzed = true;
                                    break;
                                  }
                                }
                              } else {
                                self.VKI_insert(self.VKI_dead);
                                rezzed = true;
                              } break;
                            }
                          }
                        } else rezzed = true;
                      } self.VKI_dead = false;

                      if (!rezzed && this.firstChild.nodeValue != "\xa0") {
                        if (self.VKI_deadkeysOn) {
                          for (key in self.VKI_deadkey) {
                            if (key == this.firstChild.nodeValue) {
                              self.VKI_dead = key;
                              this.className += " dead";
                              if (self.VKI_shift) self.VKI_modify("Shift");
                              if (self.VKI_alternate) self.VKI_modify("AltGr");
                              break;
                            }
                          }
                          if (!self.VKI_dead) self.VKI_insert(this.firstChild.nodeValue);
                        } else self.VKI_insert(this.firstChild.nodeValue);
                      }

                      self.VKI_modify("");
                      return false;
                    }, false);

                }
                tr.appendChild(td);
              tbody.appendChild(tr);
            table.appendChild(tbody);

            for (var z = 0; z < 4; z++)
              if (this.VKI_deadkey[lkey[z] = lkey[z] || "\xa0"]) hasDeadKey = true;
        }
        container.appendChild(table);
      }
      this.VKI_keyboard.getElementsByTagName('label')[0].style.display = (!this.VKI_layoutDDK[this.VKI_kt] && hasDeadKey) ? "inline" : "none";
    };

    this.VKI_buildKeys();
    VKI_disableSelection(this.VKI_keyboard);


    /* ******************************************************************
     * Controls modifier keys
     *
     */
    this.VKI_modify = function(type) {
      switch (type) {
        case "Alt":
        case "AltGr": this.VKI_alternate = !this.VKI_alternate; break;
        case "Caps": this.VKI_capslock = !this.VKI_capslock; break;
        case "Shift": this.VKI_shift = !this.VKI_shift; break;
      } var vchar = 0;
      if (!this.VKI_shift != !this.VKI_capslock) vchar += 1;

      var tables = this.VKI_keyboard.getElementsByTagName('table');
      for (var x = 0; x < tables.length; x++) {
        var tds = tables[x].getElementsByTagName('td');
        for (var y = 0; y < tds.length; y++) {
          var className = [];
          var lkey = this.VKI_layout[this.VKI_kt][x][y];

          if (tds[y].className.indexOf('hover') > -1) className.push("hover");

          switch (lkey[1]) {
            case "Alt":
            case "AltGr":
              if (this.VKI_alternate) className.push("dead");
              break;
            case "Shift":
              if (this.VKI_shift) className.push("dead");
              break;
            case "Caps":
              if (this.VKI_capslock) className.push("dead");
              break;
            case "Tab": case "Enter": case "Bksp": break;
            default:
              if (type) tds[y].firstChild.nodeValue = lkey[vchar + ((this.VKI_alternate && lkey.length == 4) ? 2 : 0)];
              if (this.VKI_deadkeysOn) {
                var char = tds[y].firstChild.nodeValue;
                if (this.VKI_dead) {
                  if (char == this.VKI_dead) className.push("dead");
                  for (var z = 0; z < this.VKI_deadkey[this.VKI_dead].length; z++) {
                    if (char == this.VKI_deadkey[this.VKI_dead][z][0]) {
                      className.push("target");
                      break;
                    }
                  }
                }
                for (key in this.VKI_deadkey)
                  if (key === char) { className.push("alive"); break; }
              }
          }

          if (y == tds.length - 1 && tds.length > this.VKI_keyCenter) className.push("last");
          if (lkey[0] == " ") className.push("space");
          tds[y].className = className.join(" ");
        }
      }
    };


    /* ******************************************************************
     * Insert text at the cursor
     *
     */
    this.VKI_insert = function(text) {
      this.VKI_target.focus();
      if (this.VKI_target.setSelectionRange) {
        if (this.VKI_target.readOnly && this.VKI_isWebKit) {
          var rng = [this.VKI_target.selStart || 0, this.VKI_target.selEnd || 0];
        } else var rng = [this.VKI_target.selectionStart, this.VKI_target.selectionEnd];
        this.VKI_target.value = this.VKI_target.value.substr(0, rng[0]) + text + this.VKI_target.value.substr(rng[1]);
        if (text == "\n" && window.opera) rng[0]++;
        this.VKI_target.setSelectionRange(rng[0] + text.length, rng[0] + text.length);
        if (this.VKI_target.readOnly && this.VKI_isWebKit) {
          var range = window.getSelection().getRangeAt(0);
          this.VKI_target.selStart = range.startOffset;
          this.VKI_target.selEnd = range.endOffset;
        }
      } else if (this.VKI_target.createTextRange) {
        try {
          this.VKI_target.range.select();
        } catch(e) { this.VKI_target.range = document.selection.createRange(); }
        this.VKI_target.range.text = text;
        this.VKI_target.range.collapse(true);
        this.VKI_target.range.select();
      } else this.VKI_target.value += text;
      if (this.VKI_shift) this.VKI_modify("Shift");
      if (this.VKI_alternate) this.VKI_modify("AltGr");
      this.VKI_target.focus();
    };


    /* ******************************************************************
     * Show the keyboard interface
     *
     */
    this.VKI_show = function(id) {
      if (this.VKI_target = document.getElementById(id)) {
        if (this.VKI_visible != id) {
          if (this.VKI_isIE) {
            if (!this.VKI_target.range) {
              this.VKI_target.range = this.VKI_target.createTextRange();
              this.VKI_target.range.moveStart('character', this.VKI_target.value.length);
            } this.VKI_target.range.select();
          }
          try { this.VKI_keyboard.parentNode.removeChild(this.VKI_keyboard); } catch (e) {}
          if (this.VKI_clearPasswords && this.VKI_target.type == "password") this.VKI_target.value = "";

          var elem = this.VKI_target;
          this.VKI_target.keyboardPosition = "absolute";
          do {
            if (VKI_getStyle(elem, "position") == "fixed") {
              this.VKI_target.keyboardPosition = "fixed";
              break;
            }
          } while (elem = elem.offsetParent);

          this.VKI_keyboard.style.top = this.VKI_keyboard.style.right = this.VKI_keyboard.style.bottom = this.VKI_keyboard.style.left = "auto";
          this.VKI_keyboard.style.position = this.VKI_target.keyboardPosition;
          if (this.VKI_isIE6) document.body.appendChild(this.VKI_iframe);
          document.body.appendChild(this.VKI_keyboard);

          this.VKI_visible = this.VKI_target.id;
          this.VKI_position();
          this.VKI_target.focus();
        } else this.VKI_close();
      }
    };


    /* ******************************************************************
     * Position the keyboard
     *
     */
    this.VKI_position = function() {
      if (self.VKI_visible != "") {
        var inputElemPos = VKI_findPos(self.VKI_target);
        self.VKI_keyboard.style.top = inputElemPos[1] - ((self.VKI_target.keyboardPosition == "fixed" && !self.VKI_isIE && !self.VKI_isMoz) ? VKI_scrollDist()[1] : 0) + self.VKI_target.offsetHeight + 3 + "px";
        self.VKI_keyboard.style.left = Math.min(VKI_innerDimensions()[0] - self.VKI_keyboard.offsetWidth - 15, inputElemPos[0]) + "px";
        if (self.VKI_isIE6) {
          self.VKI_iframe.style.width = self.VKI_keyboard.offsetWidth + "px";
          self.VKI_iframe.style.height = self.VKI_keyboard.offsetHeight + "px";
          self.VKI_iframe.style.top = self.VKI_keyboard.style.top;
          self.VKI_iframe.style.left = self.VKI_keyboard.style.left;
        }
      }
    };


    if (window.addEventListener) {
      window.addEventListener('resize', this.VKI_position, false); 
    } else if (window.attachEvent)
      window.attachEvent('onresize', this.VKI_position);


    /* ******************************************************************
     * Close the keyboard interface
     *
     */
    this.VKI_close = function() {
      try {
        this.VKI_keyboard.parentNode.removeChild(this.VKI_keyboard);
        if (this.VKI_isIE6) this.VKI_iframe.parentNode.removeChild(this.VKI_iframe);
      } catch (e) {}
      this.VKI_visible = "";
      //this.VKI_target.focus();
      this.VKI_target = "";
    };
  }

  function VKI_findPos(obj) {
    var curleft = curtop = 0;
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return [curleft, curtop];
  }

  function VKI_innerDimensions() {
    if (self.innerHeight) {
      return [self.innerWidth, self.innerHeight];
    } else if (document.documentElement && document.documentElement.clientHeight) {
      return [document.documentElement.clientWidth, document.documentElement.clientHeight];
    } else if (document.body)
      return [document.body.clientWidth, document.body.clientHeight];
    return [0, 0];
  }

  function VKI_scrollDist() {
    var html = document.getElementsByTagName('html')[0];
    if (html.scrollTop && document.documentElement.scrollTop) {
      return [html.scrollLeft, html.scrollTop];
    } else if (html.scrollTop || document.documentElement.scrollTop)
      return [html.scrollLeft + document.documentElement.scrollLeft, html.scrollTop + document.documentElement.scrollTop];
    return [0, 0];
  }

  function VKI_getStyle(obj, styleProp) {
    if (obj.currentStyle) {
      var y = obj.currentStyle[styleProp];
    } else if (window.getComputedStyle)
      var y = window.getComputedStyle(obj, null)[styleProp];
    return y;
  }

  function VKI_disableSelection(elem) {
    elem.onselectstart = function() { return false; };
    elem.unselectable = "on";
    elem.style.MozUserSelect = "none";
    elem.style.cursor = "default";
    if (window.opera) elem.onmousedown = function() { return false; };
  }


  var VKI_link = document.createElement('link');
      VKI_link.setAttribute('rel', "stylesheet");
      VKI_link.setAttribute('type', "text/css");
      VKI_link.setAttribute('href', "data:text/css,#keyboardInputMasterUserScript {\
  position:absolute;\
  border-top:2px solid #eeeeee;\
  border-right:2px solid #6e6e6e;\
  border-bottom:2px solid #6e6e6e;\
  border-left:2px solid #eeeeee;\
  color:#000000;\
  background-color:#dddddd;\
  text-align:left;\
  z-index:1000000;\
  width:auto;\
  margin:0px;\
  font:normal 40px Arial,sans-serif;\
  line-height:1;\
}\
#keyboardInputMasterUserScript * {\
  color:#000000;\
  background:transparent;\
  font:normal 40px Arial,sans-serif;\
  margin:0px;\
  padding:0px;\
  border:0px none;\
  outline:0px;\
  vertical-align:baseline;\
}\
\
#keyboardInputMasterUserScript thead tr th {\
  text-align:left;\
  padding:2px 5px 2px 4px;\
  background-color:inherit;\
}\
#keyboardInputMasterUserScript thead tr th select {\
  margin-right:5px;\
  border:1px inset #888888;\
  background-color:#f6f6f6;\
}\
#keyboardInputMasterUserScript thead tr th label input {\
  width:12px;\
  height:12px;\
  display: none;\
  vertical-align:middle;\
}\
#keyboardInputMasterUserScript thead tr td {\
  text-align:right;\
  vertical-align:middle;\
  padding:2px 4px 2px 5px;\
}\
#keyboardInputMasterUserScript thead tr td span {\
  padding:1px 4px;\
  font-weight:bold;\
  border-top:1px solid #e5e5e5;\
  border-right:1px solid #5d5d5d;\
  border-bottom:1px solid #5d5d5d;\
  border-left:1px solid #e5e5e5;\
  background-color:#cccccc;\
  cursor:pointer;\
  margin-left:10px; \
  margin-right:18px; \
}\
\
#keyboardInputMasterUserScript tbody tr td {\
  text-align:left;\
  padding:0px 4px 3px 4px;\
}\
#keyboardInputMasterUserScript tbody tr td div {\
  text-align:center;\
  position:relative;\
  height:0px;\
}\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout {\
  height:auto;\
}\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table {\
  height:20px;\
  white-space:nowrap;\
  width:100%;\
  border-collapse:separate;\
  border-spacing: 8px; \
}\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table.keyboardInputCenter {\
  width:auto;\
  margin:0px auto;\
}\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table tbody tr td {\
  vertical-align:middle;\
  padding-left:8px;\
  padding-right:8px;\
  padding-top:5px;\
  padding-bottom:5px;\
  white-space:pre;\
  font-family:'Lucida Console',monospace;\
  border:1px solid #5d5d5d; \
  /*border-top:1px solid #e5e5e5;\
  /*border-right:1px solid #5d5d5d;\
  border-bottom:1px solid #5d5d5d;\
  border-left:1px solid #e5e5e5;*/\
  background-color:#eeeeee;\
  cursor:default;\
  min-width:0.75em;\
}\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table tbody tr td.last {\
  width:99%;\
}\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table tbody tr td.space {\
  padding:0px 220px;\
}\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table tbody tr td.alive {\
  background-color:#ccccdd;\
}\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table tbody tr td.target {\
  background-color:#ddddcc;\
}\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table tbody tr td.hover {\
  /*border-top:1px solid #d5d5d5;\
  border-right:1px solid #555555;\
  border-bottom:1px solid #555555;\
  border-left:1px solid #d5d5d5;*/\
  background-color:#cccccc;\
}\
#keyboardInputMasterUserScript thead tr td span.pressed,\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table tbody tr td.pressed,\
#keyboardInputMasterUserScript tbody tr td div#keyboardInputLayout table tbody tr td.dead {\
  /*border-top:1px solid #555555;\
  border-right:1px solid #d5d5d5;\
  border-bottom:1px solid #d5d5d5;\
  border-left:1px solid #555555;*/\
  background-color:#8cb6e7;\
}\
\
#keyboardInputMasterUserScript tbody tr td div var {\
  position:absolute;\
  bottom:0px;\
  right:0px;\
  font-weight:bold;\
  font-style:italic;\
  color:#444444;\
}\
\
.keyboardInputInitiator {\
  margin-left:3px;\
  vertical-align:middle;\
  cursor:pointer;\
}");

  var VKI_head = VKI_title = 0;
  try {
    if (VKI_head = document.getElementsByTagName('head')[0]) {
      VKI_head.appendChild(VKI_link);
    } else if (VKI_title = document.getElementByTagName('title')[0])
      VKI_title.parentNode.insertBefore(VKI_link, VKI_title);
  } catch(e) {}

  if (VKI_head || VKI_title) VKI_buildKeyboardInputs();
}, false);
