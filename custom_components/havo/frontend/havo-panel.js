var V=globalThis,P=V.ShadowRoot&&(V.ShadyCSS===void 0||V.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),ot=new WeakMap,S=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(P&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=ot.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&ot.set(e,t))}return t}toString(){return this.cssText}},at=n=>new S(typeof n=="string"?n:n+"",void 0,G),C=(n,...t)=>{let e=n.length===1?n[0]:t.reduce((i,s,r)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[r+1],n[0]);return new S(e,n,G)},lt=(n,t)=>{if(P)n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),s=V.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,n.appendChild(i)}},J=P?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return at(e)})(n):n;var{is:Vt,defineProperty:Pt,getOwnPropertyDescriptor:It,getOwnPropertyNames:Ut,getOwnPropertySymbols:Dt,getPrototypeOf:Nt}=Object,I=globalThis,ct=I.trustedTypes,qt=ct?ct.emptyScript:"",zt=I.reactiveElementPolyfillSupport,T=(n,t)=>n,Y={toAttribute(n,t){switch(t){case Boolean:n=n?qt:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},ht=(n,t)=>!Vt(n,t),dt={attribute:!0,type:String,converter:Y,reflect:!1,useDefault:!1,hasChanged:ht};Symbol.metadata??=Symbol("metadata"),I.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=dt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&Pt(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){let{get:s,set:r}=It(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:s,set(o){let d=s?.call(this);r?.call(this,o),this.requestUpdate(t,d,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??dt}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;let t=Nt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){let e=this.properties,i=[...Ut(e),...Dt(e)];for(let s of i)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let s of i)e.unshift(J(s))}else t!==void 0&&e.push(J(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return lt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){let r=(i.converter?.toAttribute!==void 0?i.converter:Y).toAttribute(e,i.type);this._$Em=t,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){let i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let r=i.getPropertyOptions(s),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Y;this._$Em=s;let d=o.fromAttribute(e,r.type);this[s]=d??this._$Ej?.get(s)??d,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(t!==void 0){let o=this.constructor;if(s===!1&&(r=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??ht)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),r!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,r]of i){let{wrapped:o}=r,d=this[s];o!==!0||this._$AL.has(s)||d===void 0||this.C(s,void 0,r,d)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[T("elementProperties")]=new Map,v[T("finalized")]=new Map,zt?.({ReactiveElement:v}),(I.reactiveElementVersions??=[]).push("2.1.2");var Q=globalThis,ut=n=>n,U=Q.trustedTypes,pt=U?U.createPolicy("lit-html",{createHTML:n=>n}):void 0,X="$lit$",g=`lit$${Math.random().toFixed(9).slice(2)}$`,tt="?"+g,jt=`<${tt}>`,_=document,H=()=>_.createComment(""),O=n=>n===null||typeof n!="object"&&typeof n!="function",et=Array.isArray,yt=n=>et(n)||typeof n?.[Symbol.iterator]=="function",Z=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,mt=/-->/g,ft=/>/g,y=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),vt=/'/g,gt=/"/g,$t=/^(?:script|style|textarea|title)$/i,it=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),a=it(1),Xt=it(2),te=it(3),x=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),bt=new WeakMap,$=_.createTreeWalker(_,129);function _t(n,t){if(!et(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return pt!==void 0?pt.createHTML(t):t}var xt=(n,t)=>{let e=n.length-1,i=[],s,r=t===2?"<svg>":t===3?"<math>":"",o=R;for(let d=0;d<e;d++){let c=n[d],u,p,h=-1,m=0;for(;m<c.length&&(o.lastIndex=m,p=o.exec(c),p!==null);)m=o.lastIndex,o===R?p[1]==="!--"?o=mt:p[1]!==void 0?o=ft:p[2]!==void 0?($t.test(p[2])&&(s=RegExp("</"+p[2],"g")),o=y):p[3]!==void 0&&(o=y):o===y?p[0]===">"?(o=s??R,h=-1):p[1]===void 0?h=-2:(h=o.lastIndex-p[2].length,u=p[1],o=p[3]===void 0?y:p[3]==='"'?gt:vt):o===gt||o===vt?o=y:o===mt||o===ft?o=R:(o=y,s=void 0);let b=o===y&&n[d+1].startsWith("/>")?" ":"";r+=o===R?c+jt:h>=0?(i.push(u),c.slice(0,h)+X+c.slice(h)+g+b):c+g+(h===-2?d:b)}return[_t(n,r+(n[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},M=class n{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0,d=t.length-1,c=this.parts,[u,p]=xt(t,e);if(this.el=n.createElement(u,i),$.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=$.nextNode())!==null&&c.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(let h of s.getAttributeNames())if(h.endsWith(X)){let m=p[o++],b=s.getAttribute(h).split(g),L=/([.?@])?(.*)/.exec(m);c.push({type:1,index:r,name:L[2],strings:b,ctor:L[1]==="."?N:L[1]==="?"?q:L[1]==="@"?z:A}),s.removeAttribute(h)}else h.startsWith(g)&&(c.push({type:6,index:r}),s.removeAttribute(h));if($t.test(s.tagName)){let h=s.textContent.split(g),m=h.length-1;if(m>0){s.textContent=U?U.emptyScript:"";for(let b=0;b<m;b++)s.append(h[b],H()),$.nextNode(),c.push({type:2,index:++r});s.append(h[m],H())}}}else if(s.nodeType===8)if(s.data===tt)c.push({type:2,index:r});else{let h=-1;for(;(h=s.data.indexOf(g,h+1))!==-1;)c.push({type:7,index:r}),h+=g.length-1}r++}}static createElement(t,e){let i=_.createElement("template");return i.innerHTML=t,i}};function k(n,t,e=n,i){if(t===x)return t;let s=i!==void 0?e._$Co?.[i]:e._$Cl,r=O(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(n),s._$AT(n,e,i)),i!==void 0?(e._$Co??=[])[i]=s:e._$Cl=s),s!==void 0&&(t=k(n,s._$AS(n,t.values),s,i)),t}var D=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??_).importNode(e,!0);$.currentNode=s;let r=$.nextNode(),o=0,d=0,c=i[0];for(;c!==void 0;){if(o===c.index){let u;c.type===2?u=new E(r,r.nextSibling,this,t):c.type===1?u=new c.ctor(r,c.name,c.strings,this,t):c.type===6&&(u=new j(r,this,t)),this._$AV.push(u),c=i[++d]}o!==c?.index&&(r=$.nextNode(),o++)}return $.currentNode=_,s}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},E=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=l,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=k(this,t,e),O(t)?t===l||t==null||t===""?(this._$AH!==l&&this._$AR(),this._$AH=l):t!==this._$AH&&t!==x&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):yt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==l&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(_.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=M.createElement(_t(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{let r=new D(s,this),o=r.u(this.options);r.p(e),this.T(o),this._$AH=r}}_$AC(t){let e=bt.get(t.strings);return e===void 0&&bt.set(t.strings,e=new M(t)),e}k(t){et(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,s=0;for(let r of t)s===e.length?e.push(i=new n(this.O(H()),this.O(H()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=ut(t).nextSibling;ut(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},A=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=l,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=l}_$AI(t,e=this,i,s){let r=this.strings,o=!1;if(r===void 0)t=k(this,t,e,0),o=!O(t)||t!==this._$AH&&t!==x,o&&(this._$AH=t);else{let d=t,c,u;for(t=r[0],c=0;c<r.length-1;c++)u=k(this,d[i+c],e,c),u===x&&(u=this._$AH[c]),o||=!O(u)||u!==this._$AH[c],u===l?t=l:t!==l&&(t+=(u??"")+r[c+1]),this._$AH[c]=u}o&&!s&&this.j(t)}j(t){t===l?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},N=class extends A{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===l?void 0:t}},q=class extends A{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==l)}},z=class extends A{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=k(this,t,e,0)??l)===x)return;let i=this._$AH,s=t===l&&i!==l||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==l&&(i===l||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},j=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){k(this,t)}},kt={M:X,P:g,A:tt,C:1,L:xt,R:D,D:yt,V:k,I:E,H:A,N:q,U:z,B:N,F:j},Bt=Q.litHtmlPolyfillSupport;Bt?.(M,E),(Q.litHtmlVersions??=[]).push("3.3.3");var At=(n,t,e)=>{let i=e?.renderBefore??t,s=i._$litPart$;if(s===void 0){let r=e?.renderBefore??null;i._$litPart$=s=new E(t.insertBefore(H(),r),r,void 0,e??{})}return s._$AI(n),s};var st=globalThis,f=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=At(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return x}};f._$litElement$=!0,f.finalized=!0,st.litElementHydrateSupport?.({LitElement:f});var Kt=st.litElementPolyfillSupport;Kt?.({LitElement:f});(st.litElementVersions??=[]).push("4.2.2");var Et=n=>(...t)=>({_$litDirective$:n,values:t}),B=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var{I:fe}=kt;var Wt={},wt=(n,t=Wt)=>n._$AH=t;var St=Et(class extends B{constructor(){super(...arguments),this.key=l}render(n,t){return this.key=n,t}update(n,[t,e]){return t!==this.key&&(wt(n),this.key=t),e}});var K={rooms:"Rooms",general:"General settings",control:"Control",ventilations:"Ventilations",automation:"Automation",settings:"Settings",intro:"Ventilation that follows your home.",chooseRoom:"Choose a room to control its ventilation.",noRooms:"Create rooms in Home Assistant to get started.",noVentilations:"No ventilation configured in this room.",addVentilation:"Add a ventilation",configureRoom:"Configure this room",back:"Back to rooms",temperature:"Temperature",humidity:"Humidity comfort",indoorTemperature:"Room temperature",indoorHumidity:"Room humidity",outdoorTemperature:"Outdoor temperature",outdoorHumidity:"Outdoor humidity",weather:"Weather entity",sources:"Outdoor data sources",sourceHelp:"A valid dedicated sensor takes priority over weather. Weather is an estimate of outdoor conditions near your home.",name:"Name",fan:"Fan",mode:"Trigger",enabled:"Automatic ventilation",turnOn:"Turn on",turnOff:"Turn off",resume:"Resume automation",speed:"Speed",speed_min:"Minimum active speed (%)",speed_max:"Maximum active speed (%)",background:"Background speed (%)",backgroundEnabled:"Keep background ventilation",temperature_on:"Start temperature (\xB0C)",temperature_off:"Rest temperature (\xB0C)",temperature_full:"Full speed temperature (\xB0C)",humidity_on:"Humidity reference (%)",humidity_hysteresis:"Humidity hysteresis (points)",humidity_full:"Full demand humidity (%)",min_on:"Minimum running time (seconds)",min_off:"Minimum resting time (seconds)",manual_pause:"Manual hold (seconds)",onOffOnly:"On/off control",variableSpeed:"Variable speed",capabilities:"Detected capabilities",step:"Speed step",target:"Current target",actual:"Actual state",on:"On",off:"Off",unknown:"Unknown",unavailable:"Unavailable",saved:"Changes saved.",save:"Save",discard:"Discard",unsaved:"Unsaved changes",saving:"Saving\u2026",conflict:"Settings changed elsewhere. Keep your draft for reference, then discard it to load the latest version.",invalid_config:"Check the fields and threshold order.",unauthorized:"You do not have permission for this action.",not_loaded:"Havo is not loaded.",not_found:"This ventilation no longer exists.",invalid_command:"This command is not supported.",error:"The operation failed. Try again.",connected:"Live",disconnected:"Connection unavailable",search:"Search rooms",remove:"Remove ventilation",removeRoom:"Remove room configuration",confirm:"Confirm removal",cancel:"Cancel",removeHelp:"Automation stops. The current physical fan state is preserved.",thresholds:"Thresholds",timings:"Timing and manual control",speeds:"Speed and resting state",sensors:"Room sensors",start:"Start",rest:"Return to rest",fallback:"Fixed thresholds: outdoor adaptation is unavailable.",outdoorEquivalent:"Outdoor humidity at room temperature",drying:"Drying potential",thermal:"Cold-weather moderation",algorithmHelp:"Havo can start extraction up to 5 humidity points earlier when outdoor air can dry the room. Large temperature differences moderate this anticipation. Extraction remains a priority above the reference threshold.",presetsHelp:"Preset modes are not interpreted as speeds. Open the native controls to adjust them.",backgroundHelp:"Only available with speed control. Actual percentages follow the fan\u2019s supported steps.",remaining:"Remaining",minutes:"min",native:"Open native controls",otherRooms:"Include fans from other rooms",noPermission:"Control is not permitted.",initializing:"Initializing",disabled:"Automation disabled",idle:"At rest",backgroundState:"Background ventilation",temperatureState:"Temperature demand",humidityState:"Humidity extraction",manual_pauseState:"Manual hold",minimum_run:"Minimum running time",minimum_rest:"Minimum resting time",fan_unavailable:"Fan unavailable",sensor_unavailable:"Required sensor unavailable",speed_unsupported:"Speed control unavailable",on_unsupported:"Turning on unsupported",off_unsupported:"Turning off unsupported",command_failed:"Command failed; automatic retry pending",chooseEntity:"Choose an entity",searchEntities:"Search entities",clearEntity:"Clear selection",currentValue:"Current value",noResults:"No results",refineSearch:"Refine your search",results:"results",selectEntity:"Select an entity",entityUnavailable:"Selected entity is unavailable",missingSensors:"Select the room sensors before enabling automation.",newVentilation:"New ventilation",configured:"configured",readonly:"Only administrators can change settings."},Ft={rooms:"Pi\xE8ces",general:"R\xE9glages g\xE9n\xE9raux",control:"Pilotage",ventilations:"Ventilations",automation:"Automatisation",settings:"R\xE9glages",intro:"Une ventilation au rythme de ta maison.",chooseRoom:"Choisis une pi\xE8ce pour piloter sa ventilation.",noRooms:"Cr\xE9e des pi\xE8ces dans Home Assistant pour commencer.",noVentilations:"Aucune ventilation configur\xE9e dans cette pi\xE8ce.",addVentilation:"Ajouter une ventilation",configureRoom:"Configurer cette pi\xE8ce",back:"Retour aux pi\xE8ces",temperature:"Temp\xE9rature",humidity:"Confort d\u2019humidit\xE9",indoorTemperature:"Temp\xE9rature de la pi\xE8ce",indoorHumidity:"Humidit\xE9 de la pi\xE8ce",outdoorTemperature:"Temp\xE9rature ext\xE9rieure",outdoorHumidity:"Humidit\xE9 ext\xE9rieure",weather:"Entit\xE9 m\xE9t\xE9o",sources:"Donn\xE9es ext\xE9rieures",sourceHelp:"Un capteur d\xE9di\xE9 valide est prioritaire sur la m\xE9t\xE9o. La m\xE9t\xE9o estime les conditions ext\xE9rieures \xE0 proximit\xE9 de ta maison.",name:"Nom",fan:"Ventilateur",mode:"D\xE9clenchement",enabled:"Ventilation automatique",turnOn:"Allumer",turnOff:"\xC9teindre",resume:"Reprendre l\u2019automatisation",speed:"Vitesse",speed_min:"Vitesse active minimale (%)",speed_max:"Vitesse maximale (%)",background:"Vitesse de fond (%)",backgroundEnabled:"Maintenir une ventilation de fond",temperature_on:"Temp\xE9rature de d\xE9marrage (\xB0C)",temperature_off:"Temp\xE9rature de repos (\xB0C)",temperature_full:"Temp\xE9rature \xE0 pleine vitesse (\xB0C)",humidity_on:"Humidit\xE9 de r\xE9f\xE9rence (%)",humidity_hysteresis:"Hyst\xE9r\xE9sis d\u2019humidit\xE9 (points)",humidity_full:"Humidit\xE9 de demande maximale (%)",min_on:"Dur\xE9e minimale de marche (secondes)",min_off:"Dur\xE9e minimale de repos (secondes)",manual_pause:"Pause manuelle (secondes)",onOffOnly:"Marche / arr\xEAt",variableSpeed:"Vitesse r\xE9glable",capabilities:"Capacit\xE9s d\xE9tect\xE9es",step:"Palier de vitesse",target:"Cible actuelle",actual:"\xC9tat r\xE9el",on:"Allum\xE9",off:"\xC9teint",unknown:"Inconnu",unavailable:"Indisponible",saved:"Modifications enregistr\xE9es.",save:"Enregistrer",discard:"Abandonner",unsaved:"Modifications non enregistr\xE9es",saving:"Enregistrement\u2026",conflict:"Les r\xE9glages ont chang\xE9 ailleurs. Consulte ton brouillon puis abandonne-le pour charger la derni\xE8re version.",invalid_config:"V\xE9rifie les champs et l\u2019ordre des seuils.",unauthorized:"Tu n\u2019as pas les droits n\xE9cessaires pour cette action.",not_loaded:"Havo n\u2019est pas charg\xE9.",not_found:"Cette ventilation n\u2019existe plus.",invalid_command:"Cette commande n\u2019est pas prise en charge.",error:"L\u2019op\xE9ration a \xE9chou\xE9. R\xE9essaie.",connected:"En direct",disconnected:"Connexion indisponible",search:"Rechercher une pi\xE8ce",remove:"Supprimer la ventilation",removeRoom:"Supprimer la configuration de la pi\xE8ce",confirm:"Confirmer la suppression",cancel:"Annuler",removeHelp:"L\u2019automatisation s\u2019arr\xEAte. L\u2019\xE9tat actuel du ventilateur est conserv\xE9.",thresholds:"Seuils",timings:"Temporisations et contr\xF4le manuel",speeds:"Vitesse et repos",sensors:"Capteurs de la pi\xE8ce",start:"D\xE9marrage",rest:"Retour au repos",fallback:"Seuils fixes : l\u2019adaptation ext\xE9rieure est indisponible.",outdoorEquivalent:"Humidit\xE9 ext\xE9rieure \xE0 la temp\xE9rature int\xE9rieure",drying:"Potentiel d\u2019ass\xE8chement",thermal:"Mod\xE9ration par temps froid",algorithmHelp:"Havo peut anticiper l\u2019extraction de 5 points d\u2019humidit\xE9 au maximum si l\u2019air ext\xE9rieur peut ass\xE9cher la pi\xE8ce. Un grand \xE9cart de temp\xE9rature mod\xE8re cette anticipation. L\u2019extraction reste prioritaire au-dessus du seuil de r\xE9f\xE9rence.",presetsHelp:"Les modes pr\xE9d\xE9finis ne sont pas interpr\xE9t\xE9s comme des vitesses. Utilise les commandes natives pour les modifier.",backgroundHelp:"Disponible uniquement avec vitesse r\xE9glable. Les pourcentages suivent les paliers du ventilateur.",remaining:"Temps restant",minutes:"min",native:"Ouvrir les commandes natives",otherRooms:"Inclure les ventilateurs des autres pi\xE8ces",noPermission:"Commande non autoris\xE9e.",initializing:"Initialisation",disabled:"Automatisation d\xE9sactiv\xE9e",idle:"Au repos",backgroundState:"Ventilation de fond",temperatureState:"Besoin de fra\xEEcheur",humidityState:"Extraction d\u2019humidit\xE9",manual_pauseState:"Pause manuelle",minimum_run:"Dur\xE9e minimale de marche",minimum_rest:"Dur\xE9e minimale de repos",fan_unavailable:"Ventilateur indisponible",sensor_unavailable:"Capteur requis indisponible",speed_unsupported:"Vitesse r\xE9glable indisponible",on_unsupported:"Allumage non pris en charge",off_unsupported:"Arr\xEAt non pris en charge",command_failed:"\xC9chec de la commande ; nouvelle tentative pr\xE9vue",chooseEntity:"Choisir une entit\xE9",searchEntities:"Rechercher des entit\xE9s",clearEntity:"Effacer la s\xE9lection",currentValue:"Valeur actuelle",noResults:"Aucun r\xE9sultat",refineSearch:"Pr\xE9cise ta recherche",results:"r\xE9sultats",selectEntity:"Choisir une entit\xE9",entityUnavailable:"L\u2019entit\xE9 s\xE9lectionn\xE9e est indisponible",missingSensors:"Choisis les capteurs de la pi\xE8ce avant d\u2019activer l\u2019automatisation.",newVentilation:"Nouvelle ventilation",configured:"configur\xE9e(s)",readonly:"Seuls les administrateurs peuvent modifier les r\xE9glages."};function W(n,t){return t?.toLowerCase().split(/[-_]/)[0]==="fr"?Ft[n]:K[n]}function Gt(n,t){let e=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase(),i=e(`${n.name} ${n.entity_id}`);return e(t).trim().split(/\s+/).every(s=>i.includes(s))}var rt=class extends f{constructor(){super(...arguments);this.entities=[];this.value=null;this.label="";this.required=!1;this.open=!1;this.query="";this.active=-1;this.closeOutside=e=>{this.open&&!e.composedPath().includes(this)&&this.close()}}static{this.properties={entities:{attribute:!1},value:{attribute:!1},currentValue:{attribute:!1},label:{},locale:{},required:{type:Boolean},open:{state:!0},query:{state:!0},active:{state:!0}}}static{this.styles=C`
    :host {
      display: block;
      min-width: 0;
      margin: 8px 0;
      color-scheme: inherit;
      font: inherit;
      font-size: var(--ha-font-size-m, 14px);
      --picker-text: var(--primary-text-color, CanvasText);
      --picker-secondary: var(--secondary-text-color, var(--picker-text));
      --picker-surface: var(
        --ha-card-background,
        var(--card-background-color, Canvas)
      );
      --picker-line: var(--divider-color, GrayText);
      --picker-accent: var(--primary-color, Highlight);
      --picker-radius: var(--ha-border-radius-md, 8px);
    }
    * {
      box-sizing: border-box;
    }
    label {
      display: block;
      margin: 0;
      color: var(--input-label-ink-color, var(--picker-text));
    }
    .control {
      margin-top: 6px;
      min-width: 0;
    }
    .unavailable {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--picker-secondary);
    }
    input,
    button {
      font: inherit;
      color: inherit;
    }
    input {
      min-width: 0;
      width: 100%;
      min-height: 38px;
      padding: 7px 10px;
      border: 1px solid
        var(--input-outlined-idle-border-color, var(--picker-line));
      border-radius: var(--picker-radius);
      background: var(--input-fill-color, var(--picker-surface));
      color: var(--input-ink-color, var(--picker-text));
      caret-color: var(--picker-accent);
      text-overflow: ellipsis;
    }
    input::placeholder {
      color: var(--input-label-ink-color, var(--picker-secondary));
      opacity: 1;
    }
    input:hover {
      border-color: var(
        --input-outlined-hover-border-color,
        var(--picker-secondary)
      );
    }
    input:invalid {
      border-color: var(--error-color, var(--picker-text));
    }
    :focus-visible {
      outline: 2px solid var(--picker-accent);
      outline-offset: 2px;
    }
    ::selection {
      background: var(--picker-accent);
      color: var(--text-primary-color, HighlightText);
    }
    .field {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    button {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      min-height: 36px;
      padding: 6px;
      border: 1px solid transparent;
      border-radius: var(--picker-radius);
      background: transparent;
      color: var(--picker-secondary);
      cursor: pointer;
    }
    button:hover {
      background: var(--secondary-background-color, var(--picker-surface));
      color: var(--picker-text);
    }
    .results {
      max-height: 260px;
      overflow: auto;
      border: 1px solid var(--picker-line);
      border-radius: var(--picker-radius);
      background: var(--picker-surface);
      margin: 4px 0 8px;
    }
    [role="option"] {
      padding: 9px 12px;
      cursor: pointer;
      overflow-wrap: anywhere;
    }
    [role="option"][data-active],
    [role="option"]:hover {
      background: color-mix(
        in srgb,
        var(--picker-accent) 10%,
        var(--picker-surface)
      );
      outline: 2px solid var(--picker-accent);
      outline-offset: -2px;
    }
    [aria-selected="true"] {
      font-weight: var(--ha-font-weight-medium, 500);
    }
    small {
      display: block;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--picker-secondary);
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    .current-value {
      margin-top: 4px;
    }
    .help {
      color: var(--picker-secondary);
      margin: 4px 0 8px;
      line-height: 1.5;
    }
    .clear-icon {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    @media (pointer: coarse) {
      input,
      button,
      [role="option"] {
        min-height: 44px;
      }
      button {
        min-width: 44px;
      }
    }
  `}connectedCallback(){super.connectedCallback(),this.ownerDocument.addEventListener("pointerdown",this.closeOutside,!0),this.ownerDocument.addEventListener("focusin",this.closeOutside,!0)}disconnectedCallback(){this.ownerDocument.removeEventListener("pointerdown",this.closeOutside,!0),this.ownerDocument.removeEventListener("focusin",this.closeOutside,!0),super.disconnectedCallback()}t(e){return W(e,this.locale)}get selected(){return this.entities.find(e=>e.entity_id===this.value)}get results(){return this.entities.filter(e=>Gt(e,this.query)).slice(0,100)}get selectionText(){return this.value?`${this.selected?.name??this.value} (${this.value})`:""}reportValidity(){let e=this.renderRoot.querySelector("input"),i=!this.required||!!this.value;return e.setCustomValidity(i?"":this.t("chooseEntity")),i||(this.open=!0,e.focus()),e.reportValidity()}startSearch(){this.open||(this.open=!0,this.query="",this.active=-1)}close(){this.open=!1,this.query="",this.active=-1}choose(e){this.value=e,this.renderRoot.querySelector("input")?.focus(),this.close(),this.renderRoot.querySelector("input")?.setCustomValidity(""),this.dispatchEvent(new CustomEvent("entity-changed",{detail:{value:e},bubbles:!0,composed:!0}))}onKey(e){if(e.key==="Escape"){e.preventDefault(),this.close();return}if(e.key==="Tab"){this.close();return}if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault(),this.startSearch();let i=this.results.length;this.active=i?(this.active+(e.key==="ArrowDown"?1:this.active<0?0:-1)+i)%i:-1,this.updateComplete.then(()=>this.renderRoot.querySelector("[data-active]")?.scrollIntoView?.({block:"nearest"}))}else e.key==="Enter"&&this.open&&(e.preventDefault(),this.active>=0&&this.results[this.active]&&this.choose(this.results[this.active].entity_id))}render(){let e=this.open?this.results:[],i=this.value&&(!this.selected||["unknown","unavailable"].includes(this.selected.state??""));return a`<label for="entity-input"
        >${this.label}${i?a`<span class="unavailable"> · ${this.t("unavailable")}</span>`:l}</label
      >
      <div class="control" part="control">
        <div class="field">
          <input
            id="entity-input"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded=${String(this.open)}
            aria-controls="entity-results"
            aria-required=${String(this.required)}
            aria-describedby=${this.currentValue!==void 0?"entity-current-value":l}
            aria-activedescendant=${this.open&&this.active>=0&&e[this.active]?`entity-option-${this.active}`:l}
            autocomplete="off"
            spellcheck="false"
            placeholder=${this.t("searchEntities")}
            title=${this.selectionText||l}
            .value=${this.open?this.query:this.selectionText}
            @focus=${this.startSearch}
            @click=${this.startSearch}
            @keydown=${this.onKey}
            @input=${s=>{this.query=s.target.value,this.open=!0,this.active=-1}}
          />
          ${this.value?a`<button
                type="button"
                aria-label=${`${this.t("clearEntity")}: ${this.label}`}
                @click=${()=>this.choose(null)}
              >
                <svg class="clear-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  ></path>
                </svg>
              </button>`:l}
        </div>
        ${this.currentValue!==void 0?a`<small id="entity-current-value" class="current-value"
              >${this.t("currentValue")}: ${this.currentValue}</small
            >`:l}
        ${this.open?a`<div
                class="results"
                id="entity-results"
                role="listbox"
                aria-label=${this.label}
              >
                ${e.map((s,r)=>a`<div
                      role="option"
                      tabindex="-1"
                      id=${`entity-option-${r}`}
                      aria-selected=${String(s.entity_id===this.value)}
                      ?data-active=${r===this.active}
                      @mousedown=${o=>o.preventDefault()}
                      @click=${()=>this.choose(s.entity_id)}
                    >
                      ${s.name}<small
                        >${s.entity_id}${["unknown","unavailable"].includes(s.state??"")?` \xB7 ${this.t("unavailable")}`:""}</small
                      >
                    </div>`)}
              </div>
              <div class="help" role="status">
                ${e.length===0?this.t("noResults"):e.length===100?this.t("refineSearch"):`${e.length} ${this.t("results")}`}
              </div>`:l}
      </div>`}};customElements.define("havo-entity-picker",rt);var Ct=()=>({weather_entity_id:null,outdoor_temperature_entity_id:null,outdoor_humidity_entity_id:null,rooms:{}}),Rt=()=>({temperature_entity_id:null,humidity_entity_id:null,ventilations:{}}),Ht=(n,t)=>({entity_id:n,name:t,mode:"temperature",enabled:!1,temperature_on:25,temperature_off:24,temperature_full:30,humidity_on:60,humidity_hysteresis:5,humidity_full:75,background:0,speed_min:40,speed_max:100,min_on:300,min_off:120,manual_pause:3600});function Ot(){let n=new Uint32Array(4);return crypto.getRandomValues(n),Array.from(n,t=>t.toString(16).padStart(8,"0")).join("")}var w=n=>structuredClone(n),Tt=(n,t)=>JSON.stringify(n)===JSON.stringify(t);function Mt(n){return n.temperature_off<n.temperature_on&&n.temperature_on<n.temperature_full&&n.humidity_on<n.humidity_full&&n.humidity_on-5-n.humidity_hysteresis>=0&&n.background<n.speed_min&&n.speed_min<=n.speed_max}var F=class{constructor(){this.config=Ct();this.base=Ct();this.revision=0;this.conflict=!1;this.editing=!1}get dirty(){return this.editing||!Tt(this.config,this.base)}receive(t,e){if(!(e<this.revision)){if(!this.dirty){this.reset(t,e);return}e>this.revision&&(this.conflict=!0)}}reset(t,e){this.config=w(t),this.base=w(t),this.revision=e,this.conflict=this.editing=!1}acknowledge(t,e,i){Tt(this.config,t)&&!this.editing&&(this.config=w(e)),this.base=w(e),this.revision=i,this.conflict=!1}};var Lt=C`
  :host {
    display: block;
    height: 100%;
    color: var(--primary-text-color, CanvasText);
    background: var(--primary-background-color, Canvas);
    font-family: var(--ha-font-family-body, Roboto, Arial, sans-serif);
    font-size: var(--ha-font-size-m, 14px);
    --line: var(--divider-color, GrayText);
    --surface: var(--ha-card-background, var(--card-background-color, Canvas));
    --radius: var(--ha-border-radius-lg, 12px);
    --accent: var(--primary-color, Highlight);
  }
  * {
    box-sizing: border-box;
  }
  .shell {
    height: 100%;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 28px 12px;
  }
  header h1 {
    font-size: 24px;
    margin: 0;
    font-weight: 600;
  }
  header ha-icon {
    color: var(--accent);
  }
  header p {
    margin: 3px 0 0;
    color: var(--secondary-text-color);
  }
  .connection {
    margin-left: auto;
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  nav {
    display: flex;
    gap: 4px;
    padding: 0 24px 12px;
    border-bottom: 1px solid var(--line);
  }
  button,
  input,
  select {
    font: inherit;
    color: inherit;
  }
  button {
    cursor: pointer;
    border: 1px solid var(--line);
    border-radius: var(--ha-border-radius-md, 8px);
    background: var(--surface);
    padding: 9px 13px;
    min-height: 40px;
  }
  button:hover {
    background: var(--secondary-background-color);
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button.primary {
    color: var(--text-primary-color, HighlightText);
    background: var(--accent);
    border-color: var(--accent);
  }
  button[aria-selected="true"],
  button.selected {
    color: var(--accent);
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  }
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
  input,
  select {
    width: 100%;
    min-height: 40px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--input-fill-color, var(--surface));
    padding: 9px 10px;
    margin-top: 6px;
  }
  input:invalid {
    border-color: var(--error-color);
  }
  input[type="checkbox"] {
    width: 18px;
    min-height: 18px;
    margin: 0;
    accent-color: var(--accent);
  }
  input[type="range"] {
    padding: 0;
    accent-color: var(--accent);
  }
  label {
    display: block;
    font-size: 14px;
  }
  label.check {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 16px 0;
  }
  .layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    flex: 1;
    min-height: 0;
  }
  aside {
    border-right: 1px solid var(--line);
    padding: 20px 14px;
  }
  aside input {
    margin: 0 0 15px;
  }
  .room {
    display: block;
    width: 100%;
    text-align: left;
    margin-bottom: 7px;
  }
  .room small {
    display: block;
    margin-top: 5px;
    color: var(--secondary-text-color);
  }
  main {
    padding: 24px 28px 40px;
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    min-width: 0;
  }
  h2 {
    font-size: 22px;
    margin: 0 0 20px;
  }
  h3 {
    font-size: 17px;
    margin: 0;
  }
  p {
    line-height: 1.55;
  }
  .muted,
  small {
    color: var(--secondary-text-color);
  }
  .empty {
    padding: 70px 20px;
    text-align: center;
    color: var(--secondary-text-color);
  }
  .empty ha-icon {
    --mdc-icon-size: 44px;
    margin-bottom: 16px;
  }
  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 22px;
  }
  .card {
    border: 1px solid var(--line);
    background: var(--surface);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 16px;
  }
  .card-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .card-head ha-icon {
    color: var(--accent);
  }
  .card-head .badge {
    margin-left: auto;
  }
  .badge {
    border-radius: 20px;
    padding: 5px 10px;
    background: var(--secondary-background-color);
    font-size: 12px;
  }
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
    gap: 12px;
    margin: 18px 0;
  }
  .metric {
    border-left: 2px solid var(--line);
    padding-left: 12px;
  }
  .metric strong {
    display: block;
    margin: 5px 0;
    font-size: 20px;
    font-weight: 500;
  }
  .reason {
    color: var(--accent);
  }
  details {
    margin-top: 16px;
  }
  summary {
    cursor: pointer;
    padding: 8px 0;
  }
  .help {
    font-size: 13px;
    line-height: 1.55;
    color: var(--secondary-text-color);
  }
  .notice {
    margin: 12px 24px 0;
    padding: 12px 16px;
    border: 1px solid var(--line);
    border-radius: 8px;
  }
  .notice.error {
    color: var(--error-color);
    border-color: var(--error-color);
  }
  footer {
    position: sticky;
    bottom: 0;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-top: 1px solid var(--line);
    background: var(--surface);
    z-index: 2;
  }
  footer span {
    flex: 1;
  }
  .back {
    display: none;
    margin-bottom: 16px;
  }
  .danger {
    color: var(--error-color);
  }
  .entity-name {
    overflow-wrap: anywhere;
  }
  .settings-list {
    max-width: 700px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  @media (max-width: 760px) {
    header {
      padding: 18px 16px 12px;
    }
    header p {
      font-size: 12px;
    }
    nav {
      padding: 0 12px 12px;
    }
    .layout {
      display: block;
    }
    aside {
      border-right: 0;
    }
    .layout.has-room aside {
      display: none;
    }
    .layout:not(.has-room) main {
      display: none;
    }
    main {
      padding: 20px 16px 32px;
    }
    .back {
      display: inline-flex;
    }
    .grid {
      grid-template-columns: 1fr;
    }
    .tabs {
      gap: 4px;
    }
    .tabs button {
      padding: 8px 10px;
    }
    footer {
      padding: 12px;
      flex-wrap: wrap;
    }
    footer span {
      flex-basis: 100%;
    }
    .connection {
      max-width: 90px;
      text-align: right;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;var nt=class extends f{constructor(){super(...arguments);this.draft=new F;this.roomId="";this.tab="control";this.general=!1;this.query="";this.otherRooms=!1;this.error="";this.message="";this.saving=!1;this.busy=!1;this.now=Date.now()/1e3;this.removeId="";this.resetKey=0;this.epoch=0;this.editEpoch=0;this.beforeUnload=e=>{this.draft.dirty&&(e.preventDefault(),e.returnValue="")}}static{this.properties={hass:{attribute:!1},snapshot:{state:!0},roomId:{state:!0},tab:{state:!0},general:{state:!0},query:{state:!0},otherRooms:{state:!0},error:{state:!0},saving:{state:!0},message:{state:!0},busy:{state:!0},now:{state:!0},removeId:{state:!0},resetKey:{state:!0}}}static{this.styles=Lt}connectedCallback(){super.connectedCallback(),window.addEventListener("beforeunload",this.beforeUnload),this.timer=setInterval(()=>{this.now=Date.now()/1e3},1e3),this.hass&&this.connect()}disconnectedCallback(){super.disconnectedCallback(),this.epoch++,this.unsubscribe?.(),this.unsubscribe=void 0,this.connection=void 0,clearInterval(this.timer),clearTimeout(this.toastTimer),window.removeEventListener("beforeunload",this.beforeUnload)}updated(e){e.has("hass")&&(this.style.colorScheme=this.hass?.themes?.darkMode?"dark":"light",this.hass?.connection!==this.connection&&this.connect())}get locale(){return this.hass?.locale?.language??this.hass?.language}t(e){return W(e,this.locale)}reason(e){let i={background:"backgroundState",temperature:"temperatureState",humidity:"humidityState",manual_pause:"manual_pauseState"}[e??""]??e??"unknown";return this.t(i in K?i:"unknown")}async connect(){if(!this.hass||!this.isConnected)return;let e=++this.epoch;this.unsubscribe?.(),this.unsubscribe=void 0,this.connection=this.hass.connection;try{let i=await this.connection.subscribeMessage(s=>{e===this.epoch&&this.receive(s)},{type:"havo/subscribe"});e!==this.epoch?i():this.unsubscribe=i}catch(i){e===this.epoch&&this.fail(i)}}receive(e){if(this.snapshot&&e.revision<this.snapshot.revision)return;let i=this.snapshot?.admin;this.snapshot=e,!e.admin&&i?(this.draft.reset(e.config,e.revision),this.resetKey++,this.general=!1,this.tab="control",this.epoch++,this.connection=void 0,this.connect()):this.saving||this.draft.receive(e.config,e.revision),this.requestUpdate()}fail(e){let i=e?.code;this.error=i&&i in K?i:"error"}touch(){this.editEpoch++,this.message="",this.draft.editing=[...this.renderRoot.querySelectorAll("input")].some(e=>!e.validity.valid),this.requestUpdate()}validate(){let e=[...this.renderRoot.querySelectorAll("input")].find(i=>!i.validity.valid);if(e)return e.focus(),e.reportValidity(),!1;for(let[i,s]of Object.entries(this.draft.config.rooms))if(Object.values(s.ventilations).some(r=>!Mt(r)))return this.roomId=i,this.general=!1,this.tab="automation",this.error="invalid_config",!1;return!0}navigate(e){this.validate()&&(this.error="",this.removeId="",e(),this.requestUpdate())}discard(){this.snapshot&&(this.draft.reset(this.snapshot.config,this.snapshot.revision),this.error="",this.resetKey++,this.requestUpdate())}async save(){if(!this.hass||!this.snapshot?.admin||this.saving||this.draft.conflict||!this.validate())return;let e=w(this.draft.config),i=this.epoch,s=this.editEpoch;this.saving=!0,this.error="";try{let r=await this.hass.callWS({type:"havo/save",config:e,revision:this.draft.revision});if(i!==this.epoch||!this.snapshot?.admin)return;if(this.snapshot&&this.snapshot.revision>r.revision){this.draft.conflict=!0,this.error="conflict";return}s===this.editEpoch&&(this.draft.editing=!1),this.draft.acknowledge(e,r.config,r.revision),this.snapshot=r,this.message="saved",clearTimeout(this.toastTimer),this.toastTimer=setTimeout(()=>{this.message=""},4e3)}catch(r){i===this.epoch&&this.fail(r)}finally{this.saving=!1,this.requestUpdate()}}async command(e,i,s){if(!this.hass||this.busy||this.draft.dirty)return;this.busy=!0,this.error="";let r=this.epoch;try{let o=await this.hass.callWS({type:"havo/command",vent_id:e,command:i,...s!==void 0?{value:s}:{}});r===this.epoch&&this.receive(o)}catch(o){r===this.epoch&&this.fail(o)}finally{this.busy=!1}}picker(e,i,s,r){return a`<havo-entity-picker
      .label=${this.t(e)}
      .locale=${this.locale}
      .value=${i}
      .entities=${s}
      @entity-changed=${o=>{r(o.detail.value),this.touch()}}
    ></havo-entity-picker>`}sensorEntities(e){return(this.snapshot?.entities??[]).filter(i=>i.domain==="sensor"&&(i.device_class===e||(e==="temperature"?["\xB0C","\xB0F","K"].includes(i.unit??""):i.unit==="%")))}number(e,i,s,r){return a`<label
      >${this.t(i)}<input
        type="number"
        required
        step="any"
        min=${s}
        max=${r}
        data-field=${i}
        .value=${String(e[i])}
        @input=${o=>{let d=o.target;d.validity.valid&&(e[i]=d.valueAsNumber),this.touch()}}
    /></label>`}native(e){this.dispatchEvent(new CustomEvent("hass-action",{bubbles:!0,composed:!0,detail:{action:"more-info",config:{entity:e,tap_action:{action:"more-info"}}}}))}metric(e,i,s){return a`<div class="metric">
      <small>${this.t(e)}</small
      ><strong>${i==null?"\u2014":`${i.toFixed(1)}${s}`}</strong>
    </div>`}controller(e,i){let s=this.snapshot?.status[e]??{reason:"disabled"},r=this.snapshot?.entities.find(h=>h.entity_id===i.entity_id),o=s.capabilities??r?.capabilities,d=this.busy||this.draft.dirty||!this.snapshot?.controllable.includes(e),c=s.readings,u=s.decision,p=Math.max(0,Math.ceil(((s.pause_until??s.deadline??0)-this.now)/60));return a`<article class="card" data-vent=${e}>
      <div class="card-head">
        <ha-icon icon="mdi:fan"></ha-icon>
        <div>
          <h3>${i.name||r?.name||i.entity_id}</h3>
          <small
            >${o?.speed?this.t("variableSpeed"):this.t("onOffOnly")}</small
          >
        </div>
        <span class="badge"
          >${this.t(s.state==="on"?"on":s.state==="off"?"off":"unavailable")}${o?.speed&&s.state==="on"&&s.percentage!=null?` \xB7 ${s.percentage}%`:""}</span
        >
      </div>
      <p class="reason" role="status">
        ${this.reason(s.reason)}${p?` \xB7 ${this.t("remaining")} ${p} ${this.t("minutes")}`:""}
      </p>
      <div class="row">
        <button
          ?disabled=${d||!o?.available||!o.turn_on}
          @click=${()=>this.command(e,"turn_on")}
        >
          ${this.t("turnOn")}</button
        ><button
          ?disabled=${d||!o?.available||!o.turn_off}
          @click=${()=>this.command(e,"turn_off")}
        >
          ${this.t("turnOff")}</button
        ><button
          ?disabled=${d||!i.enabled}
          @click=${()=>this.command(e,"resume")}
        >
          ${this.t("resume")}</button
        ><button
          aria-label=${this.t("native")}
          title=${this.t("native")}
          @click=${()=>this.native(i.entity_id)}
        >
          <ha-icon icon="mdi:open-in-new"></ha-icon>
        </button>
      </div>
      ${o?.speed?a`<label style="margin-top:16px"
            >${this.t("speed")}<input
              aria-label=${this.t("speed")}
              type="range"
              min=${Math.max(1,Math.floor(o.step))}
              max="100"
              step=${Math.max(1,Math.floor(o.step))}
              .value=${String(s.percentage||i.speed_min)}
              ?disabled=${d||!o.available}
              @change=${h=>this.command(e,"set_percentage",Number(h.target.value))}
          /></label>`:l}
      <label class="check"
        ><input
          type="checkbox"
          .checked=${i.enabled}
          ?disabled=${d}
          @change=${h=>this.command(e,"automation",h.target.checked)}
        />${this.t("enabled")}</label
      >
      <div class="metrics">
        ${this.metric("indoorTemperature",c?.temperature," \xB0C")}${this.metric("indoorHumidity",c?.humidity," %")}${u?this.metric("start",u.on,i.mode==="temperature"?" \xB0C":" %"):l}${u?this.metric("rest",u.off,i.mode==="temperature"?" \xB0C":" %"):l}
      </div>
      ${u?.fallback?a`<p class="help">${this.t("fallback")}</p>`:l}
      ${i.mode==="humidity"?a`<details>
            <summary>${this.t("sources")}</summary>
            <p class="help">${this.t("algorithmHelp")}</p>
            <div class="metrics">
              ${this.metric("outdoorTemperature",c?.outdoor_temperature," \xB0C")}${this.metric("outdoorHumidity",c?.outdoor_humidity," %")}${this.metric("outdoorEquivalent",u?.outdoor_equivalent," %")}
            </div>
            ${Object.entries(c?.sources??{}).filter(([h])=>h.startsWith("outdoor")).map(([h,m])=>a`<p class="help entity-name">
                    ${this.t(h==="outdoor_temperature"?"outdoorTemperature":"outdoorHumidity")}:
                    ${m??"\u2014"}
                  </p>`)}
          </details>`:l}
      ${o?.speed&&s.target_percentage!=null?a`<p class="help">
            ${this.t("target")}: ${s.target_percentage}% ·
            ${this.t("step")}: ${o.step.toFixed(1)}%
          </p>`:l}
    </article>`}fans(e){let i=new Set(Object.values(this.draft.config.rooms).flatMap(r=>Object.values(r.ventilations).map(o=>o.entity_id))),s=(this.snapshot?.entities??[]).filter(r=>r.domain==="fan"&&!i.has(r.entity_id)&&(this.otherRooms||!r.area_id||r.area_id===this.roomId));return a`<section class="card">
        <h3>${this.t("addVentilation")}</h3>
        ${this.picker("fan",null,s,r=>{if(r){let o=this.snapshot?.entities.find(d=>d.entity_id===r);e.ventilations[Ot()]=Ht(r,o?.name??r),this.resetKey++}})}<label class="check"
          ><input
            type="checkbox"
            .checked=${this.otherRooms}
            @change=${r=>{this.otherRooms=r.target.checked}}
          />${this.t("otherRooms")}</label
        >
      </section>
      ${Object.entries(e.ventilations).map(([r,o])=>{let d=this.snapshot?.entities.find(c=>c.entity_id===o.entity_id)?.capabilities;return a`<section class="card">
          <div class="grid">
            <label
              >${this.t("name")}<input
                maxlength="100"
                .value=${o.name}
                @input=${c=>{o.name=c.target.value,this.touch()}}
            /></label>
            <div>
              <small>${this.t("capabilities")}</small>
              <p>
                ${d?.speed?this.t("variableSpeed"):this.t("onOffOnly")}
              </p>
            </div>
          </div>
          <p class="help entity-name">${o.entity_id}</p>
          ${d?.presets?a`<p class="help">${this.t("presetsHelp")}</p>`:l}
          ${this.removeId===r?a`<p>${this.t("removeHelp")}</p>
                <div class="row">
                  <button
                    class="danger"
                    @click=${()=>{delete e.ventilations[r],this.removeId="",this.touch()}}
                  >
                    ${this.t("confirm")}</button
                  ><button
                    @click=${()=>{this.removeId=""}}
                  >
                    ${this.t("cancel")}
                  </button>
                </div>`:a`<button
                class="danger"
                @click=${()=>{this.removeId=r}}
              >
                ${this.t("remove")}
              </button>`}
        </section>`})}`}automation(e){return a`<section class="card">
        <h3>${this.t("sensors")}</h3>
        <div class="grid">
          ${this.picker("indoorTemperature",e.temperature_entity_id,this.sensorEntities("temperature"),i=>{e.temperature_entity_id=i})}${this.picker("indoorHumidity",e.humidity_entity_id,this.sensorEntities("humidity"),i=>{e.humidity_entity_id=i})}
        </div>
      </section>
      ${Object.entries(e.ventilations).map(([i,s])=>{let r=this.snapshot?.entities.find(o=>o.entity_id===s.entity_id)?.capabilities;return a`<section class="card" data-settings=${i}>
          <h3>${s.name||s.entity_id}</h3>
          <label class="check"
            ><input
              type="checkbox"
              .checked=${s.enabled}
              @change=${o=>{s.enabled=o.target.checked,this.touch()}}
            />${this.t("enabled")}</label
          >
          <label
            >${this.t("mode")}<select
              .value=${s.mode}
              @change=${o=>this.navigate(()=>{s.mode=o.target.value,this.touch()})}
            >
              <option value="temperature">${this.t("temperature")}</option>
              <option value="humidity">${this.t("humidity")}</option>
            </select></label
          >
          <h4>${this.t("thresholds")}</h4>
          <div class="grid">
            ${s.mode==="temperature"?a`${this.number(s,"temperature_on",-40,60)}${this.number(s,"temperature_off",-40,60)}${r?.speed?this.number(s,"temperature_full",-40,60):l}`:a`${this.number(s,"humidity_on",20,90)}${this.number(s,"humidity_hysteresis",1,20)}${r?.speed?this.number(s,"humidity_full",21,100):l}`}
          </div>
          ${s.mode==="humidity"?a`<p class="help">${this.t("algorithmHelp")}</p>`:l}
          ${r?.speed?a`<details>
                <summary>${this.t("speeds")}</summary>
                <p class="help">${this.t("backgroundHelp")}</p>
                <label class="check"
                  ><input
                    type="checkbox"
                    .checked=${s.background>0}
                    @change=${o=>{s.background=o.target.checked?Math.min(20,s.speed_min-1):0,this.touch()}}
                  />${this.t("backgroundEnabled")}</label
                >
                <div class="grid">
                  ${s.background>0?this.number(s,"background",1,99):l}${this.number(s,"speed_min",1,100)}${this.number(s,"speed_max",1,100)}
                </div>
              </details>`:a`<p class="help">
                ${this.t("onOffOnly")}${s.background?` \xB7 ${this.t("speed_unsupported")}`:""}
              </p>`}
          <details>
            <summary>${this.t("timings")}</summary>
            <div class="grid">
              ${this.number(s,"min_on",0,86400)}${this.number(s,"min_off",0,86400)}${this.number(s,"manual_pause",0,86400)}
            </div>
          </details>
        </section>`})}`}roomView(){let e=this.draft.config.rooms[this.roomId],i=this.snapshot?.areas.find(r=>r.id===this.roomId)?.name??this.roomId;if(!this.roomId)return a`<div class="empty">
        <ha-icon icon="mdi:fan"></ha-icon>
        <p>${this.t("chooseRoom")}</p>
      </div>`;let s=this.snapshot?.admin?["control","ventilations","automation","settings"]:["control"];return a`<button
        class="back"
        @click=${()=>this.navigate(()=>{this.roomId=""})}
      >
        ${this.t("back")}
      </button>
      <h2>${i}</h2>
      ${e?a`<div class="tabs" role="tablist" aria-label=${i}>
              ${s.map(r=>a`<button
                    role="tab"
                    id=${`tab-${r}`}
                    aria-selected=${String(this.tab===r)}
                    aria-controls="room-panel"
                    tabindex=${this.tab===r?0:-1}
                    @click=${()=>this.navigate(()=>{this.tab=r})}
                    @keydown=${o=>{let d=s.indexOf(this.tab),c=o.key==="ArrowRight"?(d+1)%s.length:o.key==="ArrowLeft"?(d+s.length-1)%s.length:o.key==="Home"?0:o.key==="End"?s.length-1:-1;c>=0&&(o.preventDefault(),this.navigate(()=>{this.tab=s[c]}),this.updateComplete.then(()=>this.renderRoot.querySelector(`#tab-${this.tab}`)?.focus()))}}
                  >
                    ${this.t(r)}
                  </button>`)}
            </div>
            <div
              id="room-panel"
              role="tabpanel"
              aria-labelledby=${`tab-${this.tab}`}
            >
              ${this.tab==="control"?a`${Object.entries(e.ventilations).map(([r,o])=>this.controller(r,o))}${Object.keys(e.ventilations).length?l:a`<p class="muted">${this.t("noVentilations")}</p>
                        ${this.snapshot?.admin?a`<button
                              @click=${()=>{this.tab="ventilations"}}
                            >
                              ${this.t("addVentilation")}
                            </button>`:l}`}`:this.tab==="ventilations"?this.fans(e):this.tab==="automation"?this.automation(e):a`<section class="card">
                        <h3>${this.t("removeRoom")}</h3>
                        <p class="help">${this.t("removeHelp")}</p>
                        ${this.removeId==="room"?a`<div class="row">
                              <button
                                class="danger"
                                @click=${()=>{delete this.draft.config.rooms[this.roomId],this.removeId="",this.tab="control",this.touch()}}
                              >
                                ${this.t("confirm")}</button
                              ><button
                                @click=${()=>{this.removeId=""}}
                              >
                                ${this.t("cancel")}
                              </button>
                            </div>`:a`<button
                              class="danger"
                              @click=${()=>{this.removeId="room"}}
                            >
                              ${this.t("removeRoom")}
                            </button>`}
                      </section>`}
            </div>`:a`<p class="muted">${this.t("noVentilations")}</p>
            ${this.snapshot?.admin?a`<button
                  class="primary"
                  @click=${()=>{this.draft.config.rooms[this.roomId]=Rt(),this.tab="ventilations",this.touch()}}
                >
                  ${this.t("configureRoom")}
                </button>`:l}`}`}generalView(){let e=this.draft.config;return a`<main class="settings-list">
      <h2>${this.t("general")}</h2>
      <section class="card">
        <h3>${this.t("sources")}</h3>
        <p class="help">${this.t("sourceHelp")}</p>
        ${this.picker("weather",e.weather_entity_id,(this.snapshot?.entities??[]).filter(i=>i.domain==="weather"),i=>{e.weather_entity_id=i})}${this.picker("outdoorTemperature",e.outdoor_temperature_entity_id,this.sensorEntities("temperature"),i=>{e.outdoor_temperature_entity_id=i})}${this.picker("outdoorHumidity",e.outdoor_humidity_entity_id,this.sensorEntities("humidity"),i=>{e.outdoor_humidity_entity_id=i})}
      </section>
    </main>`}render(){let e=this.snapshot?.areas??[],i=[...e,...Object.keys(this.draft.config.rooms).filter(r=>!e.some(o=>o.id===r)).map(r=>({id:r,name:r}))],s=i.filter(r=>r.name.toLocaleLowerCase().includes(this.query.toLocaleLowerCase()));return a`<div class="shell">
      <header>
        <ha-icon icon="mdi:fan"></ha-icon>
        <div>
          <h1>Havo</h1>
          <p>${this.t("intro")}</p>
        </div>
        <span class="connection"
          >${this.t(this.snapshot?"connected":"disconnected")}</span
        >
      </header>
      <nav aria-label="Havo">
        <button
          class=${this.general?"":"selected"}
          @click=${()=>this.navigate(()=>{this.general=!1})}
        >
          ${this.t("rooms")}</button
        >${this.snapshot?.admin?a`<button
              class=${this.general?"selected":""}
              @click=${()=>this.navigate(()=>{this.general=!0})}
            >
              ${this.t("general")}
            </button>`:l}
      </nav>
      ${this.error||this.draft.conflict?a`<div role="alert" class="notice error">
            ${this.t(this.draft.conflict?"conflict":this.error)}
          </div>`:l}${this.message?a`<div class="notice" role="status">
            ${this.t(this.message)}
          </div>`:l}
      ${St(this.resetKey,this.general&&this.snapshot?.admin?this.generalView():a`<div class="layout ${this.roomId?"has-room":""}">
              <aside>
                <input
                  type="search"
                  aria-label=${this.t("search")}
                  placeholder=${this.t("search")}
                  .value=${this.query}
                  @input=${r=>{this.query=r.target.value}}
                />${s.map(r=>a`<button
                      class="room ${this.roomId===r.id?"selected":""}"
                      @click=${()=>this.navigate(()=>{this.roomId=r.id,this.otherRooms=!1,this.tab="control"})}
                    >
                      ${r.name}<small
                        >${Object.keys(this.draft.config.rooms[r.id]?.ventilations??{}).length}
                        ${this.t("configured")}</small
                      >
                    </button>`)}${i.length?l:a`<p class="help">${this.t("noRooms")}</p>`}
              </aside>
              <main>${this.roomView()}</main>
            </div>`)}
      ${this.draft.dirty&&this.snapshot?.admin?a`<footer>
            <span>${this.t("unsaved")}</span
            ><button ?disabled=${this.saving} @click=${this.discard}>
              ${this.t("discard")}</button
            ><button
              class="primary"
              ?disabled=${this.saving||this.draft.conflict}
              @click=${this.save}
            >
              ${this.t(this.saving?"saving":"save")}
            </button>
          </footer>`:l}
    </div>`}};customElements.define("havo-panel",nt);export{nt as HavoPanel};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/keyed.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
