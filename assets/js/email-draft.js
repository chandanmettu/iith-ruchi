/* Portable MIME email file. The user still sends/forwards it from their mail app. */
window.RuchiEmailDraft = (() => {
  const base64=bytes=>{let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);};
  const utf8=value=>base64(new TextEncoder().encode(value));
  const wrap=value=>value.match(/.{1,76}/g)?.join('\r\n')||'';
  async function create({recipient,subject,text,attachment}){
    if(!/^[^\s<>@]+@[^\s<>@]+$/.test(recipient))throw new Error('Invalid recipient');
    const types={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
    if(!attachment||!types[attachment.type])throw new Error('Unsupported photo');
    const boundary='ruchi_'+crypto.randomUUID().replaceAll('-',''),name='report-photo.'+types[attachment.type];
    const encodedSubject=Array.from(subject).reduce((parts,char,index)=>{if(index%24===0)parts.push('');parts[parts.length-1]+=char;return parts;},[]).map(part=>'=?UTF-8?B?'+utf8(part)+'?=').join('\r\n ');
    return [`To: ${recipient}`,`Subject: ${encodedSubject}`,`Date: ${new Date().toUTCString()}`,'X-Unsent: 1','MIME-Version: 1.0',`Content-Type: multipart/mixed; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',wrap(utf8(text)),'',`--${boundary}`,`Content-Type: ${attachment.type}; name="${name}"`,`Content-Disposition: attachment; filename="${name}"`,'Content-Transfer-Encoding: base64','',wrap(base64(new Uint8Array(await attachment.arrayBuffer()))),'',`--${boundary}--`,''].join('\r\n');
  }
  return {create};
})();
