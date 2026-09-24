"""Curated mathematical transformations; all paths are computed before playback."""
import math,json

def extend(records,helpers,root):
    mi,mn,mo,row,frac,power,number,texnum,path=[helpers[x] for x in ['mi','mn','mo','row','frac','power','number','texnum','path']]
    scenes=[]
    def par(s):return mo('(')+s+mo(')')
    def shift(h):return mi('x')+(mo('−' if h>0 else '+')+mn(abs(h)) if h else '')
    def factor(h):return par(shift(h))
    def tf(h):return '(x'+('-' if h>0 else '+')+str(abs(h))+')' if h else 'x'
    def coef(a):return '' if a==1 else mo('−') if a==-1 else number(a)
    def tc(a):return '' if a==1 else '-' if a==-1 else texnum(a)
    def card(id,kind,expr,tex,fn,*,markers=None,guide=None,model=None):
        g=dict(id=id,kind=kind,formula='y = '+tex,latex='y='+tex,mathml='<math xmlns="http://www.w3.org/1998/Math/MathML">'+row(mi('y')+mo('=')+expr)+'</math>',path=path(fn,kind,0),curated=True)
        if markers:g['markers']=markers
        if guide:g['guide']=guide
        if model:g['model']=model
        records.append(g);return id
    def scene(id,kinds,cards,cues):scenes.append(dict(id=id,requires=kinds,cards=[dict(graph=g,cue=cues[i]) for i,g in enumerate(cards)]))
    ids=[]
    for i,a in enumerate([.5,1,2,3]):ids.append(card('abs_width_'+str(i),'absolute',mo('|')+coef(a)+mi('x')+mo('|'),r'\left|'+tc(a)+r'x\right|',lambda x,a=a:abs(a*x),model={'type':'abs','inside':a,'outside':1}))
    scene('abs_width',['absolute'],ids,['width','narrow','narrow','narrow'])
    ids=[]
    for i,a in enumerate([-2,2]):ids.append(card('abs_sign_'+str(i),'absolute',mo('|')+coef(a)+mi('x')+mo('|'),r'\left|'+tc(a)+r'x\right|',lambda x,a=a:abs(a*x),model={'type':'abs','inside':a,'outside':1}))
    scene('abs_sign',['absolute'],ids,['same','same'])
    ids=[]
    for i,a in enumerate([1,-1]):ids.append(card('abs_flip_'+str(i),'absolute',coef(a)+mo('|')+mn(2)+mi('x')+mo('|'),tc(a)+r'|2x|',lambda x,a=a:a*abs(2*x),model={'type':'abs','inside':2,'outside':a}))
    scene('abs_flip',['absolute'],ids,['shape','flip'])
    ids=[]
    for i,a in enumerate([.25,1,2]):ids.append(card('vertex_'+str(i),'quadratic',coef(a)+power(row(factor(1)),mn(2))+mo('−')+mn(2),tc(a)+'(x-1)^2-2',lambda x,a=a:a*(x-1)**2-2,markers=[{'x':1,'y':-2}],guide={'type':'vertical','x':1},model={'type':'vertex','a':a,'b':1,'c':-2}))
    scene('vertex_width',['quadratic'],ids,['vertex','narrow','narrow'])
    ids=[]
    for i,a in enumerate([1,-1]):ids.append(card('vertex_flip_'+str(i),'quadratic',coef(a)+power(row(factor(1)),mn(2))+mo('+')+mn(1),tc(a)+'(x-1)^2+1',lambda x,a=a:a*(x-1)**2+1,markers=[{'x':1,'y':1}],guide={'type':'vertical','x':1},model={'type':'vertex','a':a,'b':1,'c':1}))
    scene('vertex_flip',['quadratic'],ids,['vertex','flip'])
    ids=[]
    for i,a in enumerate([.5,1,-1]):ids.append(card('roots_fixed_'+str(i),'quadratic',coef(a)+factor(-2)+factor(2),tc(a)+'(x+2)(x-2)',lambda x,a=a:a*(x+2)*(x-2),markers=[{'x':-2,'y':0},{'x':2,'y':0}],model={'type':'roots','a':a,'r1':-2,'r2':2}))
    scene('roots_fixed',['quadratic'],ids,['roots','roots','flip'])
    ids=[]
    for i,r in enumerate([2,1,0]):ids.append(card('roots_merge_'+str(i),'quadratic',factor(-r)+factor(r) if r else power(mi('x'),mn(2)),'(x+'+str(r)+')(x-'+str(r)+')' if r else 'x^2',lambda x,r=r:(x+r)*(x-r),markers=[{'x':-r,'y':0}]+([{'x':r,'y':0}] if r else []),model={'type':'roots','a':1,'r1':-r,'r2':r}))
    scene('roots_merge',['quadratic'],ids,['roots','rootsCloser','doubleRoot'])
    ids=[]
    exprs=[power(row(factor(1)),mn(2))+mo('−')+mn(4),factor(-1)+factor(3),power(mi('x'),mn(2))+mo('−')+mn(2)+mi('x')+mo('−')+mn(3)]
    texs=['(x-1)^2-4','(x+1)(x-3)','x^2-2x-3']
    for i,(expr,tex) in enumerate(zip(exprs,texs)):ids.append(card('equivalent_'+str(i),'quadratic',expr,tex,lambda x:(x-1)**2-4,markers=[{'x':1,'y':-4},{'x':-1,'y':0},{'x':3,'y':0}],model={'type':'vertex','a':1,'b':1,'c':-4}))
    scene('equivalent',['quadratic'],ids,['same','same','same'])
    ids=[]
    for i,fold in enumerate([False,True]):
        expr=power(mi('x'),mn(2))+mo('−')+mn(1)
        ids.append(card('fold_'+str(i),'absolute' if fold else 'quadratic',(mo('|')+expr+mo('|')) if fold else expr,'|x^2-1|' if fold else 'x^2-1',lambda x,fold=fold:abs(x*x-1) if fold else x*x-1,markers=[{'x':-1,'y':0},{'x':1,'y':0}],model={'type':'fold','fold':fold}))
    scene('fold',['quadratic','absolute'],ids,['roots','fold'])
    scene('cubic_flip',['cubic'],['cubic_1_0_0','cubic_-1_0_0'],['shape','flip'])
    for name,values in [('amplitude',[.5,1,2]),('frequency',[1,2,3])]:
        ids=[]
        for i,v in enumerate(values):
            a,b=(v,1) if name=='amplitude' else (1,v)
            expr=coef(a)+'<mi mathvariant="normal">sin</mi>'+par(coef(b)+mi('x'))
            ids.append(card('wave_'+name+'_'+str(i),'sin',expr,tc(a)+r'\sin('+tc(b)+'x)',lambda x,a=a,b=b:a*math.sin(b*x),model={'type':'wave','a':a,'b':b}))
        scene('wave_'+name,['sin'],ids,['wave',name,name])
    ids=[]
    ids.append(card('inverse_exp','exp',power(mn(2),mi('x')),'2^x',lambda x:2**x,guide={'type':'diagonal'},markers=[{'x':0,'y':1},{'x':1,'y':2}]))
    ids.append(card('inverse_log','log','<msub><mi mathvariant="normal">log</mi><mn>2</mn></msub>'+par(mi('x')),r'\log_2(x)',lambda x:math.log2(x),guide={'type':'diagonal'},markers=[{'x':1,'y':0},{'x':2,'y':1}]))
    scene('inverse',['exp','log'],ids,['inverse','inverse'])
    (root/'scenes.js').write_text('/* Complete transformation sequences, generated offline. */\nwindow.MATH_SCENES = '+json.dumps(scenes,ensure_ascii=False,separators=(',',':'))+';\n')
