"""Read native archive members without executing/loading them."""
from pathlib import Path
import hashlib

def members(path):
    data=Path(path).read_bytes()
    if not data.startswith(b'!<arch>\n'):raise ValueError('Regular archive required')
    cursor=8;result=[];strings=None
    while cursor<len(data):
        header=data[cursor:cursor+60]
        if len(header)!=60 or header[58:60]!=b'`\n':raise ValueError('Invalid archive header')
        size=int(header[48:58]);name=header[:16].decode().strip();start=cursor+60;payload=data[start:start+size]
        if len(payload)!=size:raise ValueError('Truncated archive payload')
        if name.startswith('#1/'):
            width=int(name[3:]);name=payload[:width].rstrip(b'\0').decode();payload=payload[width:]
        elif name=='//':strings=payload
        elif name.startswith('/') and name[1:].isdigit():
            if strings is None:raise ValueError('Missing archive name table')
            offset=int(name[1:]);name=strings[offset:strings.index(b'/\n',offset)].decode()
        else:name=name.removesuffix('/')
        if name not in ['', '/', '//'] and not name.startswith('__.SYMDEF'):
            if not name or '/' in name or name in ['.','..'] or any(x['name']==name for x in result):raise ValueError('Unique simple archive members required')
            result.append({'name':name,'bytes':len(payload),'sha256':hashlib.sha256(payload).hexdigest()})
        cursor=start+size+(size%2)
    if cursor!=len(data):raise ValueError('Invalid archive padding')
    return result
