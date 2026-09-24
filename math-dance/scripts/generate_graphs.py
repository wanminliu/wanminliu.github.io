"""Regenerate static curve paths. Python 3 standard library only."""
import json, math, pathlib
from fractions import Fraction
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
    expression=str(k).replace('-','−') if kind=='constant' else (('−' if a<0 else '')+(str(abs(a))+'·' if abs(a)!=1 else ''))+(('('+bases[kind]+')') if kind=='quartic' and a==-1 else bases[kind])+suffix
    records.append(dict(id=f'{kind}_{a}_{h}_{k}',kind=kind,a=a,h=h,k=k,formula='y = '+expression,path=path(fn,kind,h)))
for k in range(-4,5):add('constant',1,0,k)
for kind in ['linear','quadratic','cubic','absolute','quartic','sin','cos','tan','exp','log']:
    for a in ([-3,-2,-1.5,-1,-.5,-.25,.25,.5,1,1.5,2,3] if kind=='linear' else [-2,-1,-.5,-.25,.25,.5,1,2] if kind in ['quadratic','absolute','cubic'] else [-1,1]):
        for h in ([0] if kind=='linear' else range(-3,4) if kind=='absolute' else range(-2,3)):
            for k in range(-2,3):add(kind,a,h,k)
chain=[('f(x)','x⁴/24 − x²/2',lambda x:x**4/24-x*x/2,[1/24,0,-.5,0,0]),("f′(x)",'x³/6 − x',lambda x:x**3/6-x,[1/6,0,-1,0]),('f″(x)','x²/2 − 1',lambda x:x*x/2-1,[.5,0,-1]),('f‴(x)','x',lambda x:x,[1,0]),('f⁽⁴⁾(x)','1',lambda x:1,[1]),('f⁽⁵⁾(x)','0',lambda x:0,[0])]
for i,(notation,expr,fn,coef) in enumerate(chain):records.append(dict(id=f'derivative_{i}',kind='derivative',step=i,notation=notation,expression=expr,formula=notation+' = '+expr,path=path(fn,'derivative',0),coefficients=coef))

def mi(s):return '<mi>'+s+'</mi>'
def mn(n):return '<mn>'+str(n)+'</mn>'
def mo(s):return '<mo>'+s+'</mo>'
def row(s):return '<mrow>'+s+'</mrow>'
def absolute_math(s):
    # Isolate the fences from coefficients outside the absolute value.
    attrs=' fence="true" stretchy="true" symmetric="true" lspace="0em" rspace="0em"'
    return row('<mo form="prefix"'+attrs+'>|</mo>'+row(s)+'<mo form="postfix"'+attrs+'>|</mo>')
def frac(a,b):return '<mfrac>'+row(a)+row(b)+'</mfrac>'
def power(a,b):return '<msup>'+row(a)+row(b)+'</msup>'
def number(v):
    f=Fraction(str(abs(v)))
    return (mo('−') if v<0 else '')+(mn(f.numerator) if f.denominator==1 else frac(mn(f.numerator),mn(f.denominator)))
def texnum(v):
    f=Fraction(str(abs(v)))
    return ('-' if v<0 else '')+(str(f.numerator) if f.denominator==1 else r'\frac{'+str(f.numerator)+'}{'+str(f.denominator)+'}')
def formatted(g):
    if g['kind']=='derivative':
        i=g['step'];left=mi('f')+mo('(')+mi('x')+mo(')') if i==0 else power(mi('f'),mo('′'*i) if i<=3 else mo('(')+mn(i)+mo(')'))+mo('(')+mi('x')+mo(')')
        exprs=[frac(power(mi('x'),mn(4)),mn(24))+mo('−')+frac(power(mi('x'),mn(2)),mn(2)),frac(power(mi('x'),mn(3)),mn(6))+mo('−')+mi('x'),frac(power(mi('x'),mn(2)),mn(2))+mo('−')+mn(1),mi('x'),mn(1),mn(0)]
        tx=[r'\frac{x^4}{24}-\frac{x^2}{2}',r'\frac{x^3}{6}-x',r'\frac{x^2}{2}-1','x','1','0'][i]
        g['notationMathml']='<math xmlns="http://www.w3.org/1998/Math/MathML">'+row(left)+'</math>'
        g['latex']=('f' if i==0 else 'f'+("'"*i if i<=3 else '^{('+str(i)+')}'))+'(x)='+tx
        return left+mo('=')+exprs[i]
    kind,a,h,k=g['kind'],g['a'],g['h'],g['k']
    bare=mi('x')+(mo('−' if h>0 else '+')+mn(abs(h)) if h else '')
    z=row(mo('(')+bare+mo(')')) if h else mi('x')
    tz='x' if not h else r'\left(x'+('-' if h>0 else '+')+str(abs(h))+r'\right)'
    simple={'linear':(z,tz),'quadratic':(power(z,mn(2)),tz+'^2'),'cubic':(power(z,mn(3)),tz+'^3'),'absolute':(absolute_math(bare),r'\left|'+('x'+('-' if h>0 else '+')+str(abs(h)) if h else 'x')+r'\right|'),'quartic':(frac(power(z,mn(4)),mn(24))+mo('−')+frac(power(z,mn(2)),mn(2)),r'\frac{'+tz+r'^4}{24}-\frac{'+tz+'^2}{2}'),'exp':(power(mn(2),bare),'2^{'+('x'+('-' if h>0 else '+')+str(abs(h)) if h else 'x')+'}'),'log':('<msub><mi mathvariant="normal">log</mi><mn>2</mn></msub>'+mo('(')+bare+mo(')'),r'\log_2'+tz)}
    for t in ['sin','cos','tan']:simple[t]=('<mi mathvariant="normal">'+t+'</mi>'+mo('(')+bare+mo(')'), '\\'+t+' '+tz)
    if kind=='constant':body=number(k);tex=texnum(k)
    else:
        body,tex=simple[kind]
        if kind=='quartic' and a<0:body=mo('(')+body+mo(')');tex=r'\left('+tex+r'\right)'
        body=(mo('−') if a<0 else '')+(number(abs(a)) if abs(a)!=1 else '')+body
        tex=('-' if a<0 else '')+(texnum(abs(a)) if abs(a)!=1 else '')+tex
        if k:body+=mo('+' if k>0 else '−')+number(abs(k));tex+=('+' if k>0 else '-')+texnum(abs(k))
    g['latex']='y='+tex
    return mi('y')+mo('=')+body
for g in records:g['mathml']='<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">'+row(formatted(g))+'</math>'

from scenes import extend
extend(records, globals(), ROOT)

(ROOT/'graphs.js').write_text('/* Precomputed by scripts/generate_graphs.py. No runtime graph calculation. */\nwindow.MATH_GRAPHS = '+json.dumps(records,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(records),'precomputed graph paths')
