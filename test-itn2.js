const crypto = require('crypto');

// The EXACT payload from [ITN RAW BODY]
const itn = {
  m_payment_id: '19',
  pf_payment_id: '3389439',
  payment_status: 'COMPLETE',
  item_name: 'CleanSpaces subscription - NY108 Block',
  item_description: '',
  amount_gross: '108.00',
  amount_fee: '-2.48',
  amount_net: '105.52',
  custom_str1: '',
  custom_str2: '',
  custom_str3: '',
  custom_str4: '',
  custom_str5: '',
  custom_int1: '',
  custom_int2: '',
  custom_int3: '',
  custom_int4: '',
  custom_int5: '',
  name_first: 'CleanSpaces',
  name_last: '',
  email_address: 'b7b040001@smtp-brevo.com',
  merchant_id: '10053829'
};

const target = 'da921c207a176133acc21d98f22262f2';
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');

const encJS = (v) => encodeURIComponent(v);
const encPHP = (v) => encodeURIComponent(v)
  .replace(/%20/g, '+')
  .replace(/!/g, '%21')
  .replace(/'/g, '%27')
  .replace(/\(/g, '%28')
  .replace(/\)/g, '%29')
  .replace(/\*/g, '%2A');

function build(params, enc, passphrase, mode, includeEmpty) {
  const all = {};
  for (const [k, v] of Object.entries(params)) {
    if (includeEmpty || v !== '') all[k] = v;
  }
  if (mode === 'sorted') all.passphrase = passphrase;
  let s = Object.keys(all).sort().map((k) => k + '=' + enc(all[k])).join('&');
  if (mode === 'appended') s += '&passphrase=' + enc(passphrase);
  return s;
}

const passphrases = ['e-commercewebsite', 'CleanSpaces123', 'test123'];

for (const pass of passphrases) {
  for (const encName of ['JS', 'PHP']) {
    for (const mode of ['sorted', 'appended']) {
      for (const empties of [true, false]) {
        const enc = encName === 'JS' ? encJS : encPHP;
        const str = build(itn, enc, pass, mode, empties);
        const hash = md5(str);
        const match = hash === target ? '  <<< MATCH!!!' : '';
        console.log(pass + ' | ' + encName + '+' + mode + '+empties:' + empties + ': ' + hash + match);
      }
    }
  }
}
