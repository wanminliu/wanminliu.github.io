"""Regenerate static curve paths. Python 3 standard library only."""
import json, math, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
records=[]
def shifted(h):return 'x' if h==0 else f'(x {"−" if h>0 else "+"} {abs(h)})'
def path(fn,kind,h):
    segments=[];active=False;previous=None
    for i in range(961):
        x=-6+i/80
        if kind=='tan':
            branch=math.floor((x-h+math.pi/2)/math.pi)
            if previous is not None and branch!=previous:active=False
            previous=branch
        try:y=fn(x)
        except (ValueError,ZeroDivisionError,OverflowError):active=False;continue
        if not math.isfinite(y) or abs(y)>20:active=False;continue
        segments.append(('L' if active else 'M')+f'{400+60*x:.2f},{400-60*y:.2f}');active=True
    return ' '.join(segments)
def add(kind,a,h,k):
    z=shifted(h); suffix='' if k==0 else f' {"+" if k>0 else "−"} {abs(k)}'
    bases={'linear':z,'quadratic':z+'²','cubic':z+'³','absolute':'|'+z.strip('()')+'|','quartic':f'{z}⁴/24 − {z}²/2','sin':f'sin({z.strip("()")})','cos':f'cos({z.strip("()")})','tan':f'tan({z.strip("()")})','exp':f'2^{z}','log':f'log₂({z.strip("()")})'}
    def fn(x):
        t=x-h
        if kind=='constant':return k
        return a*{'linear':lambda:t,'quadratic':lambda:t*t,'cubic':lambda:t**3,'absolute':lambda:abs(t),'quartic':lambda:t**4/24-t*t/2,'sin':lambda:math.sin(t),'cos':lambda:math.cos(t),'tan':lambda:math.tan(t),'exp':lambda:2**t,'log':lambda:math.log2(t)}[kind]()+k
    expression=str(k).replace('-','−') if kind=='constant' else ('−' if a==-1 else '')+(('('+bases[kind]+')') if kind=='quartic' and a==-1 else bases[kind])+suffix
    records.append(dict(id=f'{kind}_{a}_{h}_{k}',kind=kind,a=a,h=h,k=k,formula='y = '+expression,path=path(fn,kind,h)))
for k in range(-4,5):add('constant',1,0,k)
for kind in ['linear','quadratic','cubic','absolute','quartic','sin','cos','tan','exp','log']:
    for a in [-1,1]:
        for h in (range(-3,4) if kind=='absolute' else range(-2,3)):
            for k in range(-2,3):add(kind,a,h,k)
chain=[('f(x)','x⁴/24 − x²/2',lambda x:x**4/24-x*x/2,[1/24,0,-.5,0,0]),("f′(x)",'x³/6 − x',lambda x:x**3/6-x,[1/6,0,-1,0]),('f″(x)','x²/2 − 1',lambda x:x*x/2-1,[.5,0,-1]),('f‴(x)','x',lambda x:x,[1,0]),('f⁽⁴⁾(x)','1',lambda x:1,[1]),('f⁽⁵⁾(x)','0',lambda x:0,[0])]
for i,(notation,expr,fn,coef) in enumerate(chain):records.append(dict(id=f'derivative_{i}',kind='derivative',step=i,notation=notation,expression=expr,formula=notation+' = '+expr,path=path(fn,'derivative',0),coefficients=coef))
(ROOT/'graphs.js').write_text('/* Precomputed by scripts/generate_graphs.py. No runtime graph calculation. */\nwindow.MATH_GRAPHS = '+json.dumps(records,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(records),'precomputed graph paths')
