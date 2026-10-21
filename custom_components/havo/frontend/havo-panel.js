var V=globalThis,L=V.ShadowRoot&&(V.ShadyCSS===void 0||V.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),le=new WeakMap,S=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(L&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=le.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&le.set(e,t))}return t}toString(){return this.cssText}},de=s=>new S(typeof s=="string"?s:s+"",void 0,G),C=(s,...t)=>{let e=s.length===1?s[0]:t.reduce((i,a,n)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+s[n+1],s[0]);return new S(e,s,G)},ce=(s,t)=>{if(L)s.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),a=V.litNonce;a!==void 0&&i.setAttribute("nonce",a),i.textContent=e.cssText,s.appendChild(i)}},J=L?s=>s:s=>s instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return de(e)})(s):s;var{is:Ie,defineProperty:Pe,getOwnPropertyDescriptor:Ue,getOwnPropertyNames:Ne,getOwnPropertySymbols:qe,getPrototypeOf:je}=Object,I=globalThis,he=I.trustedTypes,De=he?he.emptyScript:"",Be=I.reactiveElementPolyfillSupport,T=(s,t)=>s,Y={toAttribute(s,t){switch(t){case Boolean:s=s?De:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,t){let e=s;switch(t){case Boolean:e=s!==null;break;case Number:e=s===null?null:Number(s);break;case Object:case Array:try{e=JSON.parse(s)}catch{e=null}}return e}},ue=(s,t)=>!Ie(s,t),pe={attribute:!0,type:String,converter:Y,reflect:!1,useDefault:!1,hasChanged:ue};Symbol.metadata??=Symbol("metadata"),I.litPropertyMetadata??=new WeakMap;var g=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=pe){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),a=this.getPropertyDescriptor(t,i,e);a!==void 0&&Pe(this.prototype,t,a)}}static getPropertyDescriptor(t,e,i){let{get:a,set:n}=Ue(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:a,set(o){let l=a?.call(this);n?.call(this,o),this.requestUpdate(t,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??pe}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;let t=je(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){let e=this.properties,i=[...Ne(e),...qe(e)];for(let a of i)this.createProperty(a,e[a])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,a]of e)this.elementProperties.set(i,a)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let a=this._$Eu(e,i);a!==void 0&&this._$Eh.set(a,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let a of i)e.unshift(J(a))}else t!==void 0&&e.push(J(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ce(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),a=this.constructor._$Eu(t,i);if(a!==void 0&&i.reflect===!0){let n=(i.converter?.toAttribute!==void 0?i.converter:Y).toAttribute(e,i.type);this._$Em=t,n==null?this.removeAttribute(a):this.setAttribute(a,n),this._$Em=null}}_$AK(t,e){let i=this.constructor,a=i._$Eh.get(t);if(a!==void 0&&this._$Em!==a){let n=i.getPropertyOptions(a),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Y;this._$Em=a;let l=o.fromAttribute(e,n.type);this[a]=l??this._$Ej?.get(a)??l,this._$Em=null}}requestUpdate(t,e,i,a=!1,n){if(t!==void 0){let o=this.constructor;if(a===!1&&(n=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??ue)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:a,wrapped:n},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),a===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,n]of this._$Ep)this[a]=n;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[a,n]of i){let{wrapped:o}=n,l=this[a];o!==!0||this._$AL.has(a)||l===void 0||this.C(a,void 0,n,l)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};g.elementStyles=[],g.shadowRootOptions={mode:"open"},g[T("elementProperties")]=new Map,g[T("finalized")]=new Map,Be?.({ReactiveElement:g}),(I.reactiveElementVersions??=[]).push("2.1.2");var Q=globalThis,me=s=>s,P=Q.trustedTypes,ve=P?P.createPolicy("lit-html",{createHTML:s=>s}):void 0,X="$lit$",f=`lit$${Math.random().toFixed(9).slice(2)}$`,ee="?"+f,Ke=`<${ee}>`,x=document,R=()=>x.createComment(""),O=s=>s===null||typeof s!="object"&&typeof s!="function",te=Array.isArray,xe=s=>te(s)||typeof s?.[Symbol.iterator]=="function",Z=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ge=/-->/g,fe=/>/g,y=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),be=/'/g,ye=/"/g,_e=/^(?:script|style|textarea|title)$/i,ie=s=>(t,...e)=>({_$litType$:s,strings:t,values:e}),d=ie(1),tt=ie(2),it=ie(3),_=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),$e=new WeakMap,$=x.createTreeWalker(x,129);function we(s,t){if(!te(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return ve!==void 0?ve.createHTML(t):t}var ke=(s,t)=>{let e=s.length-1,i=[],a,n=t===2?"<svg>":t===3?"<math>":"",o=H;for(let l=0;l<e;l++){let r=s[l],h,u,p=-1,m=0;for(;m<r.length&&(o.lastIndex=m,u=o.exec(r),u!==null);)m=o.lastIndex,o===H?u[1]==="!--"?o=ge:u[1]!==void 0?o=fe:u[2]!==void 0?(_e.test(u[2])&&(a=RegExp("</"+u[2],"g")),o=y):u[3]!==void 0&&(o=y):o===y?u[0]===">"?(o=a??H,p=-1):u[1]===void 0?p=-2:(p=o.lastIndex-u[2].length,h=u[1],o=u[3]===void 0?y:u[3]==='"'?ye:be):o===ye||o===be?o=y:o===ge||o===fe?o=H:(o=y,a=void 0);let b=o===y&&s[l+1].startsWith("/>")?" ":"";n+=o===H?r+Ke:p>=0?(i.push(h),r.slice(0,p)+X+r.slice(p)+f+b):r+f+(p===-2?l:b)}return[we(s,n+(s[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},z=class s{constructor({strings:t,_$litType$:e},i){let a;this.parts=[];let n=0,o=0,l=t.length-1,r=this.parts,[h,u]=ke(t,e);if(this.el=s.createElement(h,i),$.currentNode=this.el.content,e===2||e===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(a=$.nextNode())!==null&&r.length<l;){if(a.nodeType===1){if(a.hasAttributes())for(let p of a.getAttributeNames())if(p.endsWith(X)){let m=u[o++],b=a.getAttribute(p).split(f),M=/([.?@])?(.*)/.exec(m);r.push({type:1,index:n,name:M[2],strings:b,ctor:M[1]==="."?N:M[1]==="?"?q:M[1]==="@"?j:k}),a.removeAttribute(p)}else p.startsWith(f)&&(r.push({type:6,index:n}),a.removeAttribute(p));if(_e.test(a.tagName)){let p=a.textContent.split(f),m=p.length-1;if(m>0){a.textContent=P?P.emptyScript:"";for(let b=0;b<m;b++)a.append(p[b],R()),$.nextNode(),r.push({type:2,index:++n});a.append(p[m],R())}}}else if(a.nodeType===8)if(a.data===ee)r.push({type:2,index:n});else{let p=-1;for(;(p=a.data.indexOf(f,p+1))!==-1;)r.push({type:7,index:n}),p+=f.length-1}n++}}static createElement(t,e){let i=x.createElement("template");return i.innerHTML=t,i}};function w(s,t,e=s,i){if(t===_)return t;let a=i!==void 0?e._$Co?.[i]:e._$Cl,n=O(t)?void 0:t._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),n===void 0?a=void 0:(a=new n(s),a._$AT(s,e,i)),i!==void 0?(e._$Co??=[])[i]=a:e._$Cl=a),a!==void 0&&(t=w(s,a._$AS(s,t.values),a,i)),t}var U=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,a=(t?.creationScope??x).importNode(e,!0);$.currentNode=a;let n=$.nextNode(),o=0,l=0,r=i[0];for(;r!==void 0;){if(o===r.index){let h;r.type===2?h=new A(n,n.nextSibling,this,t):r.type===1?h=new r.ctor(n,r.name,r.strings,this,t):r.type===6&&(h=new D(n,this,t)),this._$AV.push(h),r=i[++l]}o!==r?.index&&(n=$.nextNode(),o++)}return $.currentNode=x,a}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},A=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,a){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=w(this,t,e),O(t)?t===c||t==null||t===""?(this._$AH!==c&&this._$AR(),this._$AH=c):t!==this._$AH&&t!==_&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):xe(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==c&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(x.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,a=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=z.createElement(we(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===a)this._$AH.p(e);else{let n=new U(a,this),o=n.u(this.options);n.p(e),this.T(o),this._$AH=n}}_$AC(t){let e=$e.get(t.strings);return e===void 0&&$e.set(t.strings,e=new z(t)),e}k(t){te(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,a=0;for(let n of t)a===e.length?e.push(i=new s(this.O(R()),this.O(R()),this,this.options)):i=e[a],i._$AI(n),a++;a<e.length&&(this._$AR(i&&i._$AB.nextSibling,a),e.length=a)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=me(t).nextSibling;me(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},k=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,a,n){this.type=1,this._$AH=c,this._$AN=void 0,this.element=t,this.name=e,this._$AM=a,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=c}_$AI(t,e=this,i,a){let n=this.strings,o=!1;if(n===void 0)t=w(this,t,e,0),o=!O(t)||t!==this._$AH&&t!==_,o&&(this._$AH=t);else{let l=t,r,h;for(t=n[0],r=0;r<n.length-1;r++)h=w(this,l[i+r],e,r),h===_&&(h=this._$AH[r]),o||=!O(h)||h!==this._$AH[r],h===c?t=c:t!==c&&(t+=(h??"")+n[r+1]),this._$AH[r]=h}o&&!a&&this.j(t)}j(t){t===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},N=class extends k{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===c?void 0:t}},q=class extends k{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==c)}},j=class extends k{constructor(t,e,i,a,n){super(t,e,i,a,n),this.type=5}_$AI(t,e=this){if((t=w(this,t,e,0)??c)===_)return;let i=this._$AH,a=t===c&&i!==c||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==c&&(i===c||a);a&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},D=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){w(this,t)}},Ae={M:X,P:f,A:ee,C:1,L:ke,R:U,D:xe,V:w,I:A,H:k,N:q,U:j,B:N,F:D},Fe=Q.litHtmlPolyfillSupport;Fe?.(z,A),(Q.litHtmlVersions??=[]).push("3.3.3");var Ee=(s,t,e)=>{let i=e?.renderBefore??t,a=i._$litPart$;if(a===void 0){let n=e?.renderBefore??null;i._$litPart$=a=new A(t.insertBefore(R(),n),n,void 0,e??{})}return a._$AI(s),a};var ae=globalThis,v=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ee(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _}};v._$litElement$=!0,v.finalized=!0,ae.litElementHydrateSupport?.({LitElement:v});var We=ae.litElementPolyfillSupport;We?.({LitElement:v});(ae.litElementVersions??=[]).push("4.2.2");var Se=s=>(...t)=>({_$litDirective$:s,values:t}),B=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var{I:ft}=Ae;var Ge={},Ce=(s,t=Ge)=>s._$AH=t;var Te=Se(class extends B{constructor(){super(...arguments),this.key=c}render(s,t){return this.key=s,t}update(s,[t,e]){return t!==this.key&&(Ce(s),this.key=t),e}});var K={openSidebar:"Open Home Assistant menu",rooms:"Rooms",general:"Global settings",control:"Control",ventilations:"Ventilations",automation:"Automation",settings:"Settings",intro:"Home Assistant Ventilation Orchestrator",chooseRoom:"Choose a room",chooseRoomHelp:"Select a room to control its ventilation or adjust its settings.",unconfigured:"Not configured",configureRoomHelp:"Add the fans you want Havo to manage in this room.",ventilationCount:"ventilation",ventilationsCount:"ventilations",noRoomsMatch:"No rooms match your search.",noRooms:"Create rooms in Home Assistant to get started.",noVentilations:"No ventilation configured in this room.",addVentilation:"Add a ventilation",configureRoom:"Configure this room",back:"Back to rooms",temperature:"Temperature",humidity:"Humidity comfort",indoorTemperature:"Room temperature",indoorHumidity:"Room humidity",outdoorTemperature:"Outdoor temperature",outdoorHumidity:"Outdoor humidity",weather:"Weather entity",sources:"Outdoor data sources",sourceHelp:"A valid dedicated sensor takes priority over weather. Weather is an estimate of outdoor conditions near your home.",name:"Name",fan:"Fan",mode:"Trigger",enabled:"Automatic ventilation",turnOn:"Turn on",turnOff:"Turn off",resume:"Resume automation",speed:"Speed",speed_min:"Minimum active speed (%)",speed_max:"Maximum active speed (%)",background:"Background speed (%)",backgroundEnabled:"Keep background ventilation",temperature_on:"Start temperature (\xB0C)",temperature_off:"Rest temperature (\xB0C)",temperature_full:"Full speed temperature (\xB0C)",humidity_on:"Humidity reference (%)",humidity_hysteresis:"Humidity hysteresis (points)",humidity_full:"Full demand humidity (%)",humidity_timeout_enabled:"Limit extraction below the start threshold",humidity_timeout:"Time below the start threshold (minutes)",humidityTimeoutHelp:"Return to rest when humidity stays above the rest threshold and below the start threshold for this duration. Reaching the start threshold resets the timer. Minimum running time still applies; extraction can restart at the start threshold after the minimum rest.",humidityTimeoutRemaining:"Timed return to rest: remaining",min_on:"Minimum running time (seconds)",min_off:"Minimum resting time (seconds)",manual_pause:"Manual hold (seconds)",onOffOnly:"On/off control",variableSpeed:"Variable speed",capabilities:"Detected capabilities",step:"Speed step",target:"Current target",actual:"Actual state",on:"On",off:"Off",unknown:"Unknown",unavailable:"Unavailable",saved:"Changes saved.",save:"Save",discard:"Discard",unsaved:"Unsaved changes",saving:"Saving\u2026",conflict:"Settings changed elsewhere. Keep your draft for reference, then discard it to load the latest version.",invalid_config:"Check the fields and threshold order.",unauthorized:"You do not have permission for this action.",not_loaded:"Havo is not loaded.",not_found:"This ventilation no longer exists.",invalid_command:"This command is not supported.",error:"The operation failed. Try again.",connected:"Live",disconnected:"Connection unavailable",search:"Search rooms",remove:"Remove ventilation",removeRoom:"Remove room configuration",confirm:"Confirm removal",cancel:"Cancel",removeHelp:"Automation stops. The current physical fan state is preserved.",thresholds:"Thresholds",timings:"Timing and manual control",speeds:"Speed and resting state",sensors:"Room sensors",start:"Start",rest:"Return to rest",fallback:"Fixed thresholds: outdoor adaptation is unavailable.",outdoorEquivalent:"Outdoor humidity at room temperature",drying:"Drying potential",thermal:"Cold-weather moderation",algorithmHelp:"Havo can start extraction up to 5 humidity points earlier when outdoor air can dry the room. Large temperature differences moderate this anticipation. Extraction remains a priority above the reference threshold.",presetsHelp:"Preset modes are not interpreted as speeds. Open the native controls to adjust them.",backgroundHelp:"Only available with speed control. Actual percentages follow the fan\u2019s supported steps.",remaining:"Remaining",minutes:"min",native:"Open native controls",otherRooms:"Include fans from other rooms",noPermission:"Control is not permitted.",initializing:"Initializing",disabled:"Automation disabled",idle:"At rest",backgroundState:"Background ventilation",temperatureState:"Temperature demand",humidityState:"Humidity extraction",humidityTimeoutState:"At rest: time below the start threshold elapsed",manual_pauseState:"Manual hold",minimum_run:"Minimum running time",minimum_rest:"Minimum resting time",fan_unavailable:"Fan unavailable",sensor_unavailable:"Required sensor unavailable",speed_unsupported:"Speed control unavailable",on_unsupported:"Turning on unsupported",off_unsupported:"Turning off unsupported",command_failed:"Command failed; automatic retry pending",chooseEntity:"Choose an entity",searchEntities:"Search entities",clearEntity:"Clear selection",currentValue:"Current value",noResults:"No results",refineSearch:"Refine your search",results:"results",selectEntity:"Select an entity",entityUnavailable:"Selected entity is unavailable",missingSensors:"Select the room sensors before enabling automation.",newVentilation:"New ventilation",configured:"configured",readonly:"Only administrators can change settings."},Je={openSidebar:"Ouvrir le menu Home Assistant",rooms:"Pi\xE8ces",general:"R\xE9glages globaux",control:"Pilotage",ventilations:"Ventilations",automation:"Automatisation",settings:"R\xE9glages",intro:"Home Assistant Ventilation Orchestrator",chooseRoom:"Choisis une pi\xE8ce",chooseRoomHelp:"S\xE9lectionne une pi\xE8ce pour piloter sa ventilation ou ajuster ses r\xE9glages.",unconfigured:"Non configur\xE9e",configureRoomHelp:"Ajoute les ventilateurs que tu souhaites confier \xE0 Havo dans cette pi\xE8ce.",ventilationCount:"ventilation",ventilationsCount:"ventilations",noRoomsMatch:"Aucune pi\xE8ce ne correspond \xE0 ta recherche.",noRooms:"Cr\xE9e des pi\xE8ces dans Home Assistant pour commencer.",noVentilations:"Aucune ventilation configur\xE9e dans cette pi\xE8ce.",addVentilation:"Ajouter une ventilation",configureRoom:"Configurer cette pi\xE8ce",back:"Retour aux pi\xE8ces",temperature:"Temp\xE9rature",humidity:"Confort d\u2019humidit\xE9",indoorTemperature:"Temp\xE9rature de la pi\xE8ce",indoorHumidity:"Humidit\xE9 de la pi\xE8ce",outdoorTemperature:"Temp\xE9rature ext\xE9rieure",outdoorHumidity:"Humidit\xE9 ext\xE9rieure",weather:"Entit\xE9 m\xE9t\xE9o",sources:"Donn\xE9es ext\xE9rieures",sourceHelp:"Un capteur d\xE9di\xE9 valide est prioritaire sur la m\xE9t\xE9o. La m\xE9t\xE9o estime les conditions ext\xE9rieures \xE0 proximit\xE9 de ta maison.",name:"Nom",fan:"Ventilateur",mode:"D\xE9clenchement",enabled:"Ventilation automatique",turnOn:"Allumer",turnOff:"\xC9teindre",resume:"Reprendre l\u2019automatisation",speed:"Vitesse",speed_min:"Vitesse active minimale (%)",speed_max:"Vitesse maximale (%)",background:"Vitesse de fond (%)",backgroundEnabled:"Maintenir une ventilation de fond",temperature_on:"Temp\xE9rature de d\xE9marrage (\xB0C)",temperature_off:"Temp\xE9rature de repos (\xB0C)",temperature_full:"Temp\xE9rature \xE0 pleine vitesse (\xB0C)",humidity_on:"Humidit\xE9 de r\xE9f\xE9rence (%)",humidity_hysteresis:"Hyst\xE9r\xE9sis d\u2019humidit\xE9 (points)",humidity_full:"Humidit\xE9 de demande maximale (%)",humidity_timeout_enabled:"Limiter l\u2019extraction sous le seuil de d\xE9marrage",humidity_timeout:"Dur\xE9e sous le seuil de d\xE9marrage (minutes)",humidityTimeoutHelp:"Retour au repos si l\u2019humidit\xE9 reste au-dessus du seuil de repos et sous le seuil de d\xE9marrage pendant cette dur\xE9e. Atteindre le seuil de d\xE9marrage remet le compteur \xE0 z\xE9ro. La dur\xE9e minimale de marche reste respect\xE9e ; l\u2019extraction peut red\xE9marrer au seuil de d\xE9marrage apr\xE8s le repos minimal.",humidityTimeoutRemaining:"Retour au repos temporis\xE9 : temps restant",min_on:"Dur\xE9e minimale de marche (secondes)",min_off:"Dur\xE9e minimale de repos (secondes)",manual_pause:"Pause manuelle (secondes)",onOffOnly:"Marche / arr\xEAt",variableSpeed:"Vitesse r\xE9glable",capabilities:"Capacit\xE9s d\xE9tect\xE9es",step:"Palier de vitesse",target:"Cible actuelle",actual:"\xC9tat r\xE9el",on:"Allum\xE9",off:"\xC9teint",unknown:"Inconnu",unavailable:"Indisponible",saved:"Modifications enregistr\xE9es.",save:"Enregistrer",discard:"Abandonner",unsaved:"Modifications non enregistr\xE9es",saving:"Enregistrement\u2026",conflict:"Les r\xE9glages ont chang\xE9 ailleurs. Consulte ton brouillon puis abandonne-le pour charger la derni\xE8re version.",invalid_config:"V\xE9rifie les champs et l\u2019ordre des seuils.",unauthorized:"Tu n\u2019as pas les droits n\xE9cessaires pour cette action.",not_loaded:"Havo n\u2019est pas charg\xE9.",not_found:"Cette ventilation n\u2019existe plus.",invalid_command:"Cette commande n\u2019est pas prise en charge.",error:"L\u2019op\xE9ration a \xE9chou\xE9. R\xE9essaie.",connected:"En direct",disconnected:"Connexion indisponible",search:"Rechercher une pi\xE8ce",remove:"Supprimer la ventilation",removeRoom:"Supprimer la configuration de la pi\xE8ce",confirm:"Confirmer la suppression",cancel:"Annuler",removeHelp:"L\u2019automatisation s\u2019arr\xEAte. L\u2019\xE9tat actuel du ventilateur est conserv\xE9.",thresholds:"Seuils",timings:"Temporisations et contr\xF4le manuel",speeds:"Vitesse et repos",sensors:"Capteurs de la pi\xE8ce",start:"D\xE9marrage",rest:"Retour au repos",fallback:"Seuils fixes : l\u2019adaptation ext\xE9rieure est indisponible.",outdoorEquivalent:"Humidit\xE9 ext\xE9rieure \xE0 la temp\xE9rature int\xE9rieure",drying:"Potentiel d\u2019ass\xE8chement",thermal:"Mod\xE9ration par temps froid",algorithmHelp:"Havo peut anticiper l\u2019extraction de 5 points d\u2019humidit\xE9 au maximum si l\u2019air ext\xE9rieur peut ass\xE9cher la pi\xE8ce. Un grand \xE9cart de temp\xE9rature mod\xE8re cette anticipation. L\u2019extraction reste prioritaire au-dessus du seuil de r\xE9f\xE9rence.",presetsHelp:"Les modes pr\xE9d\xE9finis ne sont pas interpr\xE9t\xE9s comme des vitesses. Utilise les commandes natives pour les modifier.",backgroundHelp:"Disponible uniquement avec vitesse r\xE9glable. Les pourcentages suivent les paliers du ventilateur.",remaining:"Temps restant",minutes:"min",native:"Ouvrir les commandes natives",otherRooms:"Inclure les ventilateurs des autres pi\xE8ces",noPermission:"Commande non autoris\xE9e.",initializing:"Initialisation",disabled:"Automatisation d\xE9sactiv\xE9e",idle:"Au repos",backgroundState:"Ventilation de fond",temperatureState:"Besoin de fra\xEEcheur",humidityState:"Extraction d\u2019humidit\xE9",humidityTimeoutState:"Au repos : dur\xE9e sous le seuil de d\xE9marrage \xE9coul\xE9e",manual_pauseState:"Pause manuelle",minimum_run:"Dur\xE9e minimale de marche",minimum_rest:"Dur\xE9e minimale de repos",fan_unavailable:"Ventilateur indisponible",sensor_unavailable:"Capteur requis indisponible",speed_unsupported:"Vitesse r\xE9glable indisponible",on_unsupported:"Allumage non pris en charge",off_unsupported:"Arr\xEAt non pris en charge",command_failed:"\xC9chec de la commande ; nouvelle tentative pr\xE9vue",chooseEntity:"Choisir une entit\xE9",searchEntities:"Rechercher des entit\xE9s",clearEntity:"Effacer la s\xE9lection",currentValue:"Valeur actuelle",noResults:"Aucun r\xE9sultat",refineSearch:"Pr\xE9cise ta recherche",results:"r\xE9sultats",selectEntity:"Choisir une entit\xE9",entityUnavailable:"L\u2019entit\xE9 s\xE9lectionn\xE9e est indisponible",missingSensors:"Choisis les capteurs de la pi\xE8ce avant d\u2019activer l\u2019automatisation.",newVentilation:"Nouvelle ventilation",configured:"configur\xE9e(s)",readonly:"Seuls les administrateurs peuvent modifier les r\xE9glages."},Ye={openSidebar:"Abrir el men\xFA de Home Assistant",rooms:"Habitaciones",general:"Ajustes globales",control:"Control",ventilations:"Ventilaciones",automation:"Automatizaci\xF3n",settings:"Ajustes",intro:"Home Assistant Ventilation Orchestrator",chooseRoom:"Elige una habitaci\xF3n",chooseRoomHelp:"Selecciona una habitaci\xF3n para controlar su ventilaci\xF3n o modificar sus ajustes.",unconfigured:"Sin configurar",configureRoomHelp:"A\xF1ade los ventiladores que quieras que Havo gestione en esta habitaci\xF3n.",ventilationCount:"ventilaci\xF3n",ventilationsCount:"ventilaciones",noRoomsMatch:"Ninguna habitaci\xF3n coincide con tu b\xFAsqueda.",noRooms:"Crea habitaciones en Home Assistant para empezar.",noVentilations:"No hay ventilaciones configuradas en esta habitaci\xF3n.",addVentilation:"A\xF1adir una ventilaci\xF3n",configureRoom:"Configurar esta habitaci\xF3n",back:"Volver a las habitaciones",temperature:"Temperatura",humidity:"Confort de humedad",indoorTemperature:"Temperatura de la habitaci\xF3n",indoorHumidity:"Humedad de la habitaci\xF3n",outdoorTemperature:"Temperatura exterior",outdoorHumidity:"Humedad exterior",weather:"Entidad meteorol\xF3gica",sources:"Fuentes de datos exteriores",sourceHelp:"Un sensor espec\xEDfico v\xE1lido tiene prioridad sobre los datos meteorol\xF3gicos. Estos estiman las condiciones exteriores cerca de tu casa.",name:"Nombre",fan:"Ventilador",mode:"Activaci\xF3n",enabled:"Ventilaci\xF3n autom\xE1tica",turnOn:"Encender",turnOff:"Apagar",resume:"Reanudar la automatizaci\xF3n",speed:"Velocidad",speed_min:"Velocidad activa m\xEDnima (%)",speed_max:"Velocidad activa m\xE1xima (%)",background:"Velocidad de fondo (%)",backgroundEnabled:"Mantener la ventilaci\xF3n de fondo",temperature_on:"Temperatura de inicio (\xB0C)",temperature_off:"Temperatura de reposo (\xB0C)",temperature_full:"Temperatura a m\xE1xima velocidad (\xB0C)",humidity_on:"Humedad de referencia (%)",humidity_hysteresis:"Hist\xE9resis de humedad (puntos)",humidity_full:"Humedad de m\xE1xima demanda (%)",humidity_timeout_enabled:"Limitar la extracci\xF3n por debajo del umbral de inicio",humidity_timeout:"Tiempo por debajo del umbral de inicio (minutos)",humidityTimeoutHelp:"Volver al reposo si la humedad se mantiene por encima del umbral de reposo y por debajo del umbral de inicio durante este tiempo. Alcanzar el umbral de inicio reinicia el temporizador. Se respeta el tiempo m\xEDnimo de funcionamiento; la extracci\xF3n puede reiniciarse al alcanzar el umbral de inicio tras el reposo m\xEDnimo.",humidityTimeoutRemaining:"Retorno al reposo temporizado: tiempo restante",min_on:"Tiempo m\xEDnimo de funcionamiento (segundos)",min_off:"Tiempo m\xEDnimo de reposo (segundos)",manual_pause:"Pausa manual (segundos)",onOffOnly:"Control de encendido/apagado",variableSpeed:"Velocidad regulable",capabilities:"Capacidades detectadas",step:"Incremento de velocidad",target:"Objetivo actual",actual:"Estado real",on:"Encendido",off:"Apagado",unknown:"Desconocido",unavailable:"No disponible",saved:"Cambios guardados.",save:"Guardar",discard:"Descartar",unsaved:"Cambios sin guardar",saving:"Guardando\u2026",conflict:"Los ajustes han cambiado en otro lugar. Consulta tu borrador y desc\xE1rtalo para cargar la \xFAltima versi\xF3n.",invalid_config:"Comprueba los campos y el orden de los umbrales.",unauthorized:"No tienes permiso para realizar esta acci\xF3n.",not_loaded:"Havo no est\xE1 cargado.",not_found:"Esta ventilaci\xF3n ya no existe.",invalid_command:"Este comando no es compatible.",error:"La operaci\xF3n ha fallado. Int\xE9ntalo de nuevo.",connected:"En directo",disconnected:"Conexi\xF3n no disponible",search:"Buscar habitaciones",remove:"Eliminar la ventilaci\xF3n",removeRoom:"Eliminar la configuraci\xF3n de la habitaci\xF3n",confirm:"Confirmar eliminaci\xF3n",cancel:"Cancelar",removeHelp:"La automatizaci\xF3n se detiene. Se conserva el estado actual del ventilador.",thresholds:"Umbrales",timings:"Temporizaci\xF3n y control manual",speeds:"Velocidad y reposo",sensors:"Sensores de la habitaci\xF3n",start:"Inicio",rest:"Retorno al reposo",fallback:"Umbrales fijos: la adaptaci\xF3n al exterior no est\xE1 disponible.",outdoorEquivalent:"Humedad exterior a la temperatura interior",drying:"Potencial de secado",thermal:"Moderaci\xF3n por fr\xEDo",algorithmHelp:"Havo puede anticipar la extracci\xF3n hasta 5 puntos de humedad si el aire exterior puede secar la habitaci\xF3n. Una gran diferencia de temperatura modera esta anticipaci\xF3n. La extracci\xF3n sigue siendo prioritaria por encima del umbral de referencia.",presetsHelp:"Los modos predefinidos no se interpretan como velocidades. Utiliza los controles nativos para modificarlos.",backgroundHelp:"Solo disponible con control de velocidad. Los porcentajes siguen los incrementos admitidos por el ventilador.",remaining:"Tiempo restante",minutes:"min",native:"Abrir los controles nativos",otherRooms:"Incluir ventiladores de otras habitaciones",noPermission:"Control no permitido.",initializing:"Inicializando",disabled:"Automatizaci\xF3n desactivada",idle:"En reposo",backgroundState:"Ventilaci\xF3n de fondo",temperatureState:"Demanda de refrigeraci\xF3n",humidityState:"Extracci\xF3n de humedad",humidityTimeoutState:"En reposo: ha transcurrido el tiempo por debajo del umbral de inicio",manual_pauseState:"Pausa manual",minimum_run:"Tiempo m\xEDnimo de funcionamiento",minimum_rest:"Tiempo m\xEDnimo de reposo",fan_unavailable:"Ventilador no disponible",sensor_unavailable:"Sensor requerido no disponible",speed_unsupported:"Control de velocidad no disponible",on_unsupported:"Encendido no compatible",off_unsupported:"Apagado no compatible",command_failed:"El comando ha fallado; reintento autom\xE1tico pendiente",chooseEntity:"Elige una entidad",searchEntities:"Buscar entidades",clearEntity:"Borrar selecci\xF3n",currentValue:"Valor actual",noResults:"Sin resultados",refineSearch:"Afina tu b\xFAsqueda",results:"resultados",selectEntity:"Selecciona una entidad",entityUnavailable:"La entidad seleccionada no est\xE1 disponible",missingSensors:"Selecciona los sensores de la habitaci\xF3n antes de activar la automatizaci\xF3n.",newVentilation:"Nueva ventilaci\xF3n",configured:"configuradas",readonly:"Solo los administradores pueden modificar los ajustes."};function oe(s){let t=s?.trim().toLowerCase().split(/[-_]/)[0];return t==="fr"||t==="es"?t:"en"}function F(s,t){return{en:K,fr:Je,es:Ye}[oe(t)][s]}function se(s,t){let e=a=>a.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase(),i=e(`${s.name} ${s.entity_id}`);return e(t).trim().split(/\s+/).every(a=>i.includes(a))}var ne=class extends v{constructor(){super(...arguments);this.entities=[];this.value=null;this.label="";this.required=!1;this.open=!1;this.query="";this.active=-1;this.closeOutside=e=>{this.open&&!e.composedPath().includes(this)&&this.close()}}static{this.properties={entities:{attribute:!1},value:{attribute:!1},currentValue:{attribute:!1},label:{},locale:{},required:{type:Boolean},open:{state:!0},query:{state:!0},active:{state:!0}}}static{this.styles=C`
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
  `}connectedCallback(){super.connectedCallback(),this.ownerDocument.addEventListener("pointerdown",this.closeOutside,!0),this.ownerDocument.addEventListener("focusin",this.closeOutside,!0)}disconnectedCallback(){this.ownerDocument.removeEventListener("pointerdown",this.closeOutside,!0),this.ownerDocument.removeEventListener("focusin",this.closeOutside,!0),super.disconnectedCallback()}t(e){return F(e,this.locale)}get selected(){return this.entities.find(e=>e.entity_id===this.value)}get results(){return this.entities.filter(e=>se(e,this.query)).slice(0,100)}get selectionText(){return this.value?`${this.selected?.name??this.value} (${this.value})`:""}reportValidity(){let e=this.renderRoot.querySelector("input"),i=!this.required||!!this.value;return e.setCustomValidity(i?"":this.t("chooseEntity")),i||(this.open=!0,e.focus()),e.reportValidity()}startSearch(){this.open||(this.open=!0,this.query="",this.active=-1)}close(){this.open=!1,this.query="",this.active=-1}choose(e){this.value=e,this.renderRoot.querySelector("input")?.focus(),this.close(),this.renderRoot.querySelector("input")?.setCustomValidity(""),this.dispatchEvent(new CustomEvent("entity-changed",{detail:{value:e},bubbles:!0,composed:!0}))}onKey(e){if(e.key==="Escape"){e.preventDefault(),this.close();return}if(e.key==="Tab"){this.close();return}if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault(),this.startSearch();let i=this.results.length;this.active=i?(this.active+(e.key==="ArrowDown"?1:this.active<0?0:-1)+i)%i:-1,this.updateComplete.then(()=>this.renderRoot.querySelector("[data-active]")?.scrollIntoView?.({block:"nearest"}))}else e.key==="Enter"&&this.open&&(e.preventDefault(),this.active>=0&&this.results[this.active]&&this.choose(this.results[this.active].entity_id))}render(){let e=this.open?this.results:[],i=this.value&&(!this.selected||["unknown","unavailable"].includes(this.selected.state??""));return d`<label for="entity-input"
        >${this.label}${i?d`<span class="unavailable"> · ${this.t("unavailable")}</span>`:c}</label
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
            aria-describedby=${this.currentValue!==void 0?"entity-current-value":c}
            aria-activedescendant=${this.open&&this.active>=0&&e[this.active]?`entity-option-${this.active}`:c}
            autocomplete="off"
            spellcheck="false"
            placeholder=${this.t("searchEntities")}
            title=${this.selectionText||c}
            .value=${this.open?this.query:this.selectionText}
            @focus=${this.startSearch}
            @click=${this.startSearch}
            @keydown=${this.onKey}
            @input=${a=>{this.query=a.target.value,this.open=!0,this.active=-1}}
          />
          ${this.value?d`<button
                type="button"
                aria-label=${`${this.t("clearEntity")}: ${this.label}`}
                @click=${()=>this.choose(null)}
              >
                <svg class="clear-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  ></path>
                </svg>
              </button>`:c}
        </div>
        ${this.currentValue!==void 0?d`<small id="entity-current-value" class="current-value"
              >${this.t("currentValue")}: ${this.currentValue}</small
            >`:c}
        ${this.open?d`<div
                class="results"
                id="entity-results"
                role="listbox"
                aria-label=${this.label}
              >
                ${e.map((a,n)=>d`<div
                      role="option"
                      tabindex="-1"
                      id=${`entity-option-${n}`}
                      aria-selected=${String(a.entity_id===this.value)}
                      ?data-active=${n===this.active}
                      @mousedown=${o=>o.preventDefault()}
                      @click=${()=>this.choose(a.entity_id)}
                    >
                      ${a.name}<small
                        >${a.entity_id}${["unknown","unavailable"].includes(a.state??"")?` \xB7 ${this.t("unavailable")}`:""}</small
                      >
                    </div>`)}
              </div>
              <div class="help" role="status">
                ${e.length===0?this.t("noResults"):e.length===100?this.t("refineSearch"):`${e.length} ${this.t("results")}`}
              </div>`:c}
      </div>`}};customElements.define("havo-entity-picker",ne);var He=()=>({weather_entity_id:null,outdoor_temperature_entity_id:null,outdoor_humidity_entity_id:null,rooms:{}}),Oe=()=>({temperature_entity_id:null,humidity_entity_id:null,ventilations:{}}),ze=(s,t)=>({entity_id:s,name:t,mode:"temperature",enabled:!1,temperature_on:25,temperature_off:24,temperature_full:30,humidity_on:75,humidity_hysteresis:5,humidity_full:85,humidity_timeout_enabled:!1,humidity_timeout:10800,background:0,speed_min:40,speed_max:100,min_on:300,min_off:120,manual_pause:3600});function Me(){let s=new Uint32Array(4);return crypto.getRandomValues(s),Array.from(s,t=>t.toString(16).padStart(8,"0")).join("")}var E=s=>structuredClone(s),Re=(s,t)=>JSON.stringify(s)===JSON.stringify(t);function Ve(s){return s.temperature_off<s.temperature_on&&s.temperature_on<s.temperature_full&&s.humidity_on<s.humidity_full&&s.humidity_on-5-s.humidity_hysteresis>=0&&typeof s.humidity_timeout_enabled=="boolean"&&Number.isFinite(s.humidity_timeout)&&s.humidity_timeout>=60&&s.humidity_timeout<=86400&&s.background<s.speed_min&&s.speed_min<=s.speed_max}var W=class{constructor(){this.config=He();this.base=He();this.revision=0;this.conflict=!1;this.editing=!1}get dirty(){return this.editing||!Re(this.config,this.base)}receive(t,e){if(!(e<this.revision)){if(!this.dirty){this.reset(t,e);return}e>this.revision&&(this.conflict=!0)}}reset(t,e){this.config=E(t),this.base=E(t),this.revision=e,this.conflict=this.editing=!1}acknowledge(t,e,i){Re(this.config,t)&&!this.editing&&(this.config=E(e)),this.base=E(e),this.revision=i,this.conflict=!1}};var Le=C`
  :host {
    --havo-bg: var(--primary-background-color, Canvas);
    --havo-surface: var(--ha-card-background, var(--card-background-color, var(--havo-bg)));
    --havo-muted-bg: var(--secondary-background-color, var(--havo-surface));
    --havo-text: var(--primary-text-color, CanvasText);
    --havo-secondary: var(--secondary-text-color, var(--havo-text));
    --havo-line: var(--divider-color, var(--outline-color, GrayText));
    --havo-accent: var(--primary-color, Highlight);
    --havo-on-accent: var(--text-primary-color, HighlightText);
    --havo-selected: color-mix(in srgb, var(--havo-accent) 10%, var(--havo-surface));
    --havo-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
    --havo-control-radius: var(--ha-border-radius-md, 8px);
    --havo-fast: var(--ha-animation-duration-fast, 150ms);
    --havo-space: var(--ha-space-4, 16px);
    display: flex; flex-direction: column; height: 100vh; height: 100dvh; overflow: hidden;
    color: var(--havo-text); background: var(--havo-bg); color-scheme: inherit;
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, inherit));
    font-size: var(--ha-font-size-m, 14px); line-height: var(--ha-line-height-normal, 1.6);
    font-weight: var(--ha-font-weight-normal, 400);
  }
  * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb-color,var(--havo-line)) transparent; }
  [hidden] { display: none !important; }
  ::selection { background: var(--havo-accent); color: var(--havo-on-accent); }
  :focus-visible { outline: 2px solid var(--havo-accent); outline-offset: 3px; }
  .app-header {
    display: flex; align-items: center; gap: var(--ha-space-6, 24px); min-height: 60px;
    padding: 0 var(--ha-space-5, 20px); flex-shrink: 0; z-index: 3;
    background: var(--app-header-background-color, var(--havo-surface));
    color: var(--app-header-text-color, var(--havo-text));
    border-bottom: var(--app-header-border-bottom, 1px solid var(--havo-line));
  }
  .brand { display: flex; align-items: center; gap: var(--ha-space-3, 12px); flex-shrink: 0; }
  .brand h1 { font-size: var(--ha-font-size-xl, 20px); margin: 0; letter-spacing: -.02em; }
  .brand small { display: none; }
  ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; display: inline-flex; flex-shrink: 0; color: currentColor; }
  .brand ha-icon { --mdc-icon-size: 24px; width: 24px; height: 24px; }
  h1,h2,h3,h4 { font-family: var(--ha-font-family-heading, var(--ha-font-family-body, inherit)); font-weight: var(--ha-font-weight-bold, 700); line-height: var(--ha-line-height-condensed, 1.2); overflow-wrap: anywhere; }
  h2 { font-size: var(--ha-font-size-xl, 20px); margin: 0; }
  h3 { font-size: var(--ha-font-size-l, 16px); margin: 0 0 var(--ha-space-3, 12px); }
  h4 { font-size: var(--ha-font-size-m, 14px); margin: 0 0 var(--ha-space-2, 8px); }
  p { margin: var(--ha-space-2, 8px) 0 var(--ha-space-4, 16px); }
  small,.help,.room-meta { color: var(--havo-secondary); }
  small { font-size: var(--ha-font-size-s, 12px); }
  .help { line-height: 1.55; max-width: 75ch; }
  .content { flex: 1; min-height: 0; display: flex; overflow: hidden; }
  main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
  .row,.actions,.section-actions { display: flex; align-items: center; gap: var(--ha-space-2, 8px); flex-wrap: wrap; }
  .grow { flex: 1; min-width: 0; }
  .top-nav { display: flex; align-self: stretch; gap: var(--ha-space-2, 8px); min-width: 0; }
  .top-nav button {
    position: relative; border: 0; border-radius: 0; padding: var(--ha-space-3, 12px) var(--ha-space-4, 16px);
    background: transparent; color: inherit; font-weight: var(--ha-font-weight-medium, 500);
  }
  .top-nav button[aria-current="page"]::after {
    content: ""; position: absolute; inset-inline: var(--ha-space-4, 16px); bottom: 0; height: 3px;
    background: currentColor; border-radius: 3px 3px 0 0;
  }
  .top-nav button:hover:not(:disabled) { background: color-mix(in srgb, currentColor 8%, transparent); }
  .workspace { display: grid; grid-template-columns: 264px minmax(0,1fr); flex: 1; min-height: 0; }
  .room-rail { min-height: 0; overflow-y: auto; background: var(--havo-surface); border-inline-end: 1px solid var(--havo-line); padding: var(--ha-space-4, 16px) var(--ha-space-3, 12px); }
  .rail-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 8px 12px; }
  .rail-heading h2 { font-size: var(--ha-font-size-l, 16px); }
  .rail-search { margin: 0 4px 12px; }
  .room-list { list-style: none; margin: 0; padding: 0; }
  .room-item { display: flex; align-items: center; gap: 4px; padding: 3px; margin-bottom: 4px; border-radius: var(--havo-control-radius); min-width: 0; }
  .room-item[data-active] { background: var(--havo-selected); }
  .room-link { justify-content: flex-start; display: flex; gap: 10px; align-items: center; flex: 1; min-width: 0; text-align: start; border: 0; background: transparent; padding: 10px 8px; }
  .room-link > span { min-width: 0; }
  .room-link strong { display: block; font-weight: var(--ha-font-weight-medium, 500); overflow-wrap: anywhere; }
  .room-link .room-meta { display: block; font-size: var(--ha-font-size-s, 12px); line-height: 1.45; overflow-wrap: anywhere; }
  .room-item[data-active] .room-link { color: var(--havo-accent); }
  .quick-toggle { align-self: center; margin-inline-end: 4px; }
  .quick-toggle[aria-pressed="true"],.room-item[data-state="on"] .room-link > ha-icon {
    color: var(--state-fan-on-color, var(--state-fan-active-color, var(--state-active-color, var(--havo-accent))));
  }
  .quick-toggle[aria-pressed="false"] { color: var(--state-fan-off-color, var(--state-fan-inactive-color, var(--state-inactive-color, var(--havo-secondary)))); }
  .room-detail { min-width: 0; min-height: 0; overflow: auto; padding: var(--ha-space-5, 20px) var(--ha-space-6, 24px) 32px; scroll-padding: 16px; }
  .room-heading { display: flex; align-items: center; justify-content: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
  .room-heading .help { margin: 4px 0 0; }
  .room-heading .back-button { display: none; }
  .room-heading h2 { font-size: var(--ha-font-size-2xl, 24px); }
  .room-tabs { display: flex; gap: 4px; overflow-x: auto; padding: 4px 0; border-bottom: 1px solid var(--havo-line); margin-bottom: var(--ha-space-5, 20px); }
  .room-tabs button { flex-shrink: 0; border: 0; background: transparent; color: var(--havo-secondary); border-radius: var(--havo-control-radius); padding: 8px 12px; }
  .room-tabs button[aria-current="page"],.room-tabs button[aria-selected="true"] { color: var(--havo-accent); background: var(--havo-selected); font-weight: var(--ha-font-weight-medium, 500); }
  .room-panel { min-width: 0; }
  .room-detail .notice { margin: 12px 0; }
  section,.card { min-width: 0; }
  .room-panel > section,.room-panel > details,.room-panel > div > section { padding: 0; margin-bottom: 24px; }
  .section-heading { display: flex; align-items: center; gap: 12px; justify-content: space-between; flex-wrap: wrap; margin-bottom: 16px; }
  .section-heading .help-details { margin: 0; }
  .settings-group { padding: 20px 0; border-bottom: 1px solid var(--havo-line); }
  .settings-group:first-child { padding-top: 0; }
  .compact-help { font-size: var(--ha-font-size-s,12px); }
  .room-summary { margin-bottom: 16px; }
  .count { color: var(--havo-secondary); font-size: var(--ha-font-size-s,12px); font-variant-numeric: tabular-nums; }
  .danger-zone { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--havo-line); }
  .section-heading h2 { font-size: var(--ha-font-size-l, 16px); }
  .room-panel > details > summary { font-size: var(--ha-font-size-l, 16px); }
  .grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,290px),1fr)); gap: var(--ha-space-5, 20px); }
  .field-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,200px),1fr)); gap: var(--ha-space-2, 8px) var(--ha-space-4, 16px); }
  label { display: flex; flex-direction: column; gap: 6px; font-size: var(--ha-font-size-m, 14px); margin: 8px 0; min-width: 0; }
  /* Share label/control rows, including the entity picker's shadow content. */
  .field-grid > label:not(.check),.field-grid > havo-entity-picker { display: grid; grid-row: span 2; grid-template-rows: subgrid; row-gap: 6px; align-items: start; }
  .field-grid > havo-entity-picker::part(control) { margin-top: 0; }
  .check { flex-direction: row; align-items: center; gap: 10px; min-height: 32px; cursor: pointer; }
  input,select,button { font: inherit; }
  input,select { min-width: 0; width: 100%; min-height: 38px; padding: 7px 10px; border: 1px solid var(--input-outlined-idle-border-color,var(--havo-line)); border-radius: var(--havo-control-radius); background: var(--input-fill-color,var(--havo-surface)); color: var(--input-ink-color,var(--havo-text)); caret-color: var(--havo-accent); }
  input:hover,select:hover { border-color: var(--input-outlined-hover-border-color,var(--havo-secondary)); }
  input::placeholder { color: var(--input-label-ink-color,var(--havo-secondary)); opacity: 1; }
  input[type="checkbox"] { width: 18px; height: 18px; min-height: 18px; padding: 0; flex-shrink: 0; accent-color: var(--havo-accent); }
  input[type="color"] { padding: 3px; }
  input:invalid { border-color: var(--error-color,var(--havo-text)); }
  button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; max-width: 100%; padding: 7px 12px; border: 1px solid var(--outline-color,var(--havo-line)); border-radius: var(--havo-control-radius); background: var(--havo-surface); color: var(--havo-text); cursor: pointer; line-height: 1.4; transition: background-color var(--havo-fast),color var(--havo-fast),border-color var(--havo-fast); }
  button:hover:not(:disabled) { background: var(--havo-muted-bg); border-color: var(--outline-hover-color,var(--havo-secondary)); }
  button:active:not(:disabled) { background: var(--havo-selected); }
  button.primary { background: var(--havo-accent); color: var(--havo-on-accent); border-color: transparent; }
  button.primary:hover:not(:disabled) { background: var(--havo-accent); filter: brightness(.94); }
  button:disabled { color: var(--disabled-text-color,var(--havo-secondary)); cursor: default; }
  button.primary:disabled { background: var(--havo-muted-bg); border-color: var(--havo-line); filter: none; }
  .icon-button { width: 36px; min-width: 36px; height: 36px; padding: 7px; border-color: transparent; background: transparent; }
  .app-header .sidebar-toggle { width: 48px; min-width: 48px; height: 48px; padding: 12px; flex-shrink: 0; border: 0; border-radius: 50%; color: inherit; }
  .app-header .sidebar-toggle:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
  .danger { color: var(--error-color,var(--havo-text)); }
  .badge { display: inline-flex; align-items: center; gap: 5px; font-size: var(--ha-font-size-s,12px); color: var(--havo-secondary); padding: 2px 0; font-variant-numeric: tabular-nums; }
  .badge + .badge::before { content: "·"; margin-inline: 8px; }
  .notice { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; margin: 12px 20px; background: var(--havo-selected); border: 1px solid var(--havo-line); border-radius: var(--havo-control-radius); line-height: 1.5; }
  .notice.error { color: var(--error-color,var(--havo-text)); background: var(--havo-surface); }
  .savebar { flex-shrink: 0; z-index: 4; display: flex; align-items: center; gap: 12px; padding: 12px 20px calc(12px + env(safe-area-inset-bottom,0px)); border-top: 1px solid var(--havo-line); background: var(--havo-surface); }
  .savebar .grow { font-size: var(--ha-font-size-m,14px); }
  details { min-width: 0; }
  summary { cursor: pointer; font-weight: var(--ha-font-weight-medium,500); min-height: 36px; padding: 6px 0; }
  details[open] > summary { margin-bottom: 12px; }
  .help-details { color: var(--havo-secondary); margin: 8px 0 16px; }
  .help-details summary ha-icon { vertical-align: middle; margin-inline-end: 4px; }
  .help-details summary { font-size: var(--ha-font-size-s,12px); min-height: 28px; }
  .help-details .help { margin: 0 0 10px; }
  .help-details[open] > summary { margin-bottom: 4px; }
  .shell { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
  .room-panel > .card { padding: 0 0 24px; margin: 0 0 24px; border-bottom: 1px solid var(--havo-line); }
  .room-panel > .card:last-child { border-bottom: 0; }
  .card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .card-head h3 { margin-bottom: 4px; }
  .card-head .badge { margin-inline-start: auto; }
  .card-head[data-state="on"] > ha-icon { color: var(--state-fan-on-color, var(--state-fan-active-color, var(--state-active-color, var(--havo-accent)))); }
  .control-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 12px 0; }
  .control-actions .check { margin: 0; }
  .reason { color: var(--havo-secondary); font-size: var(--ha-font-size-s,12px); }
  .metrics { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,145px),1fr)); gap: 12px; margin: 18px 0; }
  .metric { border-inline-start: 2px solid var(--havo-line); padding-inline-start: 12px; }
  .metric strong { display: block; margin: 5px 0; font-size: var(--ha-font-size-xl,20px); font-weight: var(--ha-font-weight-medium,500); font-variant-numeric: tabular-nums; }
  .entity-name { overflow-wrap: anywhere; }
  .muted { color: var(--havo-secondary); }
  .speed-control { margin-top: 16px; }
  input[type="range"] { padding: 0; border: 0; accent-color: var(--havo-accent); background: transparent; }
  .global-settings { padding: 24px; overflow: auto; flex: 1; min-height: 0; }
  .global-settings > section { max-width: 980px; margin: 0 auto 28px; }
  .global-settings > h2 { max-width: 980px; margin: 0 auto 24px; }
  .empty-state { padding: 40px 24px; max-width: 520px; margin: 8vh auto 0; }
  .empty-state > ha-icon { --mdc-icon-size: 32px; width: 32px; height: 32px; color: var(--havo-secondary); margin-bottom: 16px; }
  .empty-state p { color: var(--havo-secondary); }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  @media (max-width:1100px) {
    .workspace { grid-template-columns: 224px minmax(0,1fr); }
    .room-detail { padding: 16px 18px 28px; }
    .room-tabs button { padding: 8px 10px; }
  }
  @media (max-width:760px) {
    .app-header { gap: 8px; padding: 8px 12px 0; flex-wrap: wrap; min-height: 52px; }
    .brand { padding-bottom: 8px; gap: 8px; }
    .brand h1 { font-size: var(--ha-font-size-l,16px); }
    .top-nav { margin-inline-start: auto; overflow-x: auto; }
    .top-nav button { padding: 10px 9px; font-size: var(--ha-font-size-s,12px); }
    .workspace { display: block; overflow: hidden; }
    .room-rail { height: 100%; border-inline-end: 0; padding: 16px 12px; }
    .workspace:not(.has-room) .room-detail { display: none; }
    .workspace.has-room .room-rail { display: none; }
    .workspace.has-room .room-detail { display: block; height: 100%; }
    .room-detail { padding: 16px 14px 28px; }
    .room-heading .back-button { display: inline-flex; }
    .room-link { padding: 12px 8px; }
    .room-heading h2 { font-size: var(--ha-font-size-xl,20px); }
    .room-tabs { margin-inline: -14px; padding: 4px 14px 8px; }
    .global-settings { padding: 20px 14px; }
    .savebar { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px 14px calc(10px + env(safe-area-inset-bottom,0px)); }
    .savebar .grow { grid-column: 1 / -1; font-size: var(--ha-font-size-s,12px); }
    .savebar button { min-width: 0; padding: 9px 6px; font-size: var(--ha-font-size-s,12px); }
    .notice { margin: 8px 12px; flex-wrap: wrap; }
    .empty-state { margin-top: 24px; padding: 16px; }
    .card-head { flex-wrap: wrap; }
    .card-head > div { flex: 1; min-width: 0; }
  }
  @media (pointer:coarse) { button,input,select,summary { min-height: 44px; } input[type="checkbox"] { min-height: 20px; width: 20px; height: 20px; } .icon-button { width: 44px; min-width: 44px; height: 44px; } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
`;var re=class extends v{constructor(){super(...arguments);this.narrow=!1;this.draft=new W;this.roomId="";this.tab="control";this.general=!1;this.query="";this.otherRooms=!1;this.error="";this.message="";this.saving=!1;this.busy=!1;this.now=Date.now()/1e3;this.removeId="";this.resetKey=0;this.epoch=0;this.editEpoch=0;this.beforeUnload=e=>{this.draft.dirty&&(e.preventDefault(),e.returnValue="")}}static{this.properties={hass:{attribute:!1},narrow:{type:Boolean},snapshot:{state:!0},roomId:{state:!0},tab:{state:!0},general:{state:!0},query:{state:!0},otherRooms:{state:!0},error:{state:!0},saving:{state:!0},message:{state:!0},busy:{state:!0},now:{state:!0},removeId:{state:!0},resetKey:{state:!0}}}static{this.styles=Le}connectedCallback(){super.connectedCallback(),window.addEventListener("beforeunload",this.beforeUnload),this.timer=setInterval(()=>{this.now=Date.now()/1e3},1e3),this.hass&&this.connect()}disconnectedCallback(){super.disconnectedCallback(),this.epoch++,this.unsubscribe?.(),this.unsubscribe=void 0,this.connection=void 0,clearInterval(this.timer),clearTimeout(this.toastTimer),window.removeEventListener("beforeunload",this.beforeUnload)}updated(e){e.has("hass")&&(this.style.colorScheme=this.hass?.themes?.darkMode?"dark":"light",this.hass?.connection!==this.connection&&this.connect())}get locale(){return this.hass?.locale?.language??this.hass?.language}t(e){return F(e,this.locale)}reason(e){let i={background:"backgroundState",temperature:"temperatureState",humidity:"humidityState",humidity_timeout:"humidityTimeoutState",manual_pause:"manual_pauseState"}[e??""]??e??"unknown";return this.t(i in K?i:"unknown")}async connect(){if(!this.hass||!this.isConnected)return;let e=++this.epoch;this.unsubscribe?.(),this.unsubscribe=void 0,this.connection=this.hass.connection;try{let i=await this.connection.subscribeMessage(a=>{e===this.epoch&&this.receive(a)},{type:"havo/subscribe"});e!==this.epoch?i():this.unsubscribe=i}catch(i){e===this.epoch&&this.fail(i)}}receive(e){if(this.snapshot&&e.revision<this.snapshot.revision)return;let i=this.snapshot?.admin;this.snapshot=e,!e.admin&&i?(this.draft.reset(e.config,e.revision),this.resetKey++,this.general=!1,this.tab="control",this.epoch++,this.connection=void 0,this.connect()):this.saving||this.draft.receive(e.config,e.revision),this.requestUpdate()}fail(e){let i=e?.code;this.error=i&&i in K?i:"error"}touch(){this.editEpoch++,this.message="",this.draft.editing=[...this.renderRoot.querySelectorAll("input")].some(e=>!e.validity.valid),this.requestUpdate()}validate(){let e=[...this.renderRoot.querySelectorAll("input")].find(i=>!i.validity.valid);if(e)return e.focus(),e.reportValidity(),!1;for(let[i,a]of Object.entries(this.draft.config.rooms))if(Object.values(a.ventilations).some(n=>!Ve(n)))return this.roomId=i,this.general=!1,this.tab="automation",this.error="invalid_config",!1;return!0}navigate(e){this.validate()&&(this.error="",this.removeId="",e(),this.requestUpdate())}discard(){this.snapshot&&(this.draft.reset(this.snapshot.config,this.snapshot.revision),this.error="",this.resetKey++,this.requestUpdate())}async save(){if(!this.hass||!this.snapshot?.admin||this.saving||this.draft.conflict||!this.validate())return;let e=E(this.draft.config),i=this.epoch,a=this.editEpoch;this.saving=!0,this.error="";try{let n=await this.hass.callWS({type:"havo/save",config:e,revision:this.draft.revision});if(i!==this.epoch||!this.snapshot?.admin)return;if(this.snapshot&&this.snapshot.revision>n.revision){this.draft.conflict=!0,this.error="conflict";return}a===this.editEpoch&&(this.draft.editing=!1),this.draft.acknowledge(e,n.config,n.revision),this.snapshot=n,this.message="saved",clearTimeout(this.toastTimer),this.toastTimer=setTimeout(()=>{this.message=""},4e3)}catch(n){i===this.epoch&&this.fail(n)}finally{this.saving=!1,this.requestUpdate()}}async requestCommand(e,i,a){if(!this.hass)return!1;let n=this.epoch;try{let o=await this.hass.callWS({type:"havo/command",vent_id:e,command:i,...a!==void 0?{value:a}:{}});return n!==this.epoch?!1:(this.receive(o),!0)}catch(o){return n===this.epoch&&this.fail(o),!1}}async command(e,i,a){if(!this.hass||this.busy||this.draft.dirty)return!1;this.busy=!0,this.error="";try{return await this.requestCommand(e,i,a)}finally{this.busy=!1}}roomState(e){let i=this.draft.config.rooms[e],a=Object.entries(i?.ventilations??{}),n=a.map(([h])=>this.snapshot?.status[h]),o=n.some(h=>h?.state==="on"),l=n.some(h=>!h||!["on","off"].includes(h.state??"")),r=n.find(h=>h?.reason==="manual_pause")??n.find(h=>h?.state==="on")??n[0];return{room:i,entries:a,on:o,unavailable:l,description:l?this.t("unavailable"):this.reason(r?.reason??"idle")}}roomCommand(e,i,a=!1){let n=this.roomState(e),o=i??(n.on?"turn_off":"turn_on"),l=(!this.busy||a)&&!this.saving&&!this.draft.dirty&&n.entries.length>0&&n.entries.every(([r,h])=>{let u=this.snapshot?.config.rooms[e]?.ventilations[r],p=this.snapshot?.status[r]?.capabilities??this.snapshot?.entities.find(m=>m.entity_id===h.entity_id)?.capabilities;return u?.entity_id===h.entity_id&&this.snapshot?.controllable.includes(r)&&p?.available&&p[o]});return{action:o,allowed:l,targets:n.entries.map(([r,h])=>({id:r,entityId:h.entity_id}))}}async toggleRoom(e){let i=this.roomCommand(e);if(!i.allowed)return;let a=this.epoch;this.busy=!0,this.error="";try{for(let n of i.targets){let o=this.roomCommand(e,i.action,!0),l=o.targets.length===i.targets.length&&i.targets.every(r=>o.targets.some(h=>h.id===r.id&&h.entityId===r.entityId));if(a!==this.epoch||!o.allowed||!l||!await this.requestCommand(n.id,i.action))return}}finally{this.busy=!1}}picker(e,i,a,n){return d`<havo-entity-picker
      .label=${this.t(e)}
      .locale=${this.locale}
      .value=${i}
      .entities=${a}
      @entity-changed=${o=>{n(o.detail.value),this.touch()}}
    ></havo-entity-picker>`}sensorEntities(e){return(this.snapshot?.entities??[]).filter(i=>i.domain==="sensor"&&(i.device_class===e||(e==="temperature"?["\xB0C","\xB0F","K"].includes(i.unit??""):i.unit==="%")))}number(e,i,a,n,o=1){return d`<label
      >${this.t(i)}<input
        type="number"
        required
        step="any"
        min=${a}
        max=${n}
        data-field=${i}
        .value=${String(Number(e[i])/o)}
        @input=${l=>{let r=l.target;r.validity.valid&&(e[i]=r.valueAsNumber*o),this.touch()}}
    /></label>`}native(e){this.dispatchEvent(new CustomEvent("hass-action",{bubbles:!0,composed:!0,detail:{action:"more-info",config:{entity:e,tap_action:{action:"more-info"}}}}))}metric(e,i,a){return d`<div class="metric">
      <small>${this.t(e)}</small
      ><strong>${i==null?"\u2014":`${i.toFixed(1)}${a}`}</strong>
    </div>`}controller(e,i){let a=this.snapshot?.status[e]??{reason:"disabled"},n=this.snapshot?.entities.find(p=>p.entity_id===i.entity_id),o=a.capabilities??n?.capabilities,l=this.busy||this.draft.dirty||!this.snapshot?.controllable.includes(e),r=a.readings,h=a.decision,u=Math.max(0,Math.ceil(((a.pause_until??a.deadline??0)-this.now)/60));return d`<article class="card ventilation-control" data-vent=${e}>
      <div class="card-head" data-state=${a.state??"unavailable"}>
        <ha-icon
          icon=${a.state==="on"?"mdi:fan":"mdi:fan-off"}
        ></ha-icon>
        <div>
          <h3>${i.name||n?.name||i.entity_id}</h3>
          <small
            >${o?.speed?this.t("variableSpeed"):this.t("onOffOnly")}</small
          >
        </div>
        <span class="badge"
          >${this.t(a.state==="on"?"on":a.state==="off"?"off":"unavailable")}${o?.speed&&a.state==="on"&&a.percentage!=null?` \xB7 ${a.percentage}%`:""}</span
        >
      </div>
      <p class="reason" role="status">
        ${this.reason(a.reason)}${u?` \xB7 ${this.t("remaining")} ${u} ${this.t("minutes")}`:""}
      </p>
      ${a.humidity_timeout_at!=null?d`<p class="help" data-status="humidity-timeout">
            ${this.t("humidityTimeoutRemaining")}
            ${Math.max(0,Math.ceil((a.humidity_timeout_at-this.now)/60))}
            ${this.t("minutes")}
          </p>`:c}
      <div class="control-actions">
        <div class="row">
          <button
            ?disabled=${l||!o?.available||!o.turn_on}
            @click=${()=>this.command(e,"turn_on")}
          >
            <ha-icon icon="mdi:fan"></ha-icon>${this.t("turnOn")}</button
          ><button
            ?disabled=${l||!o?.available||!o.turn_off}
            @click=${()=>this.command(e,"turn_off")}
          >
            <ha-icon icon="mdi:fan-off"></ha-icon>${this.t("turnOff")}</button
          ><button
            ?disabled=${l||!i.enabled}
            @click=${()=>this.command(e,"resume")}
          >
            ${this.t("resume")}</button
          ><button
            class="icon-button"
            aria-label=${this.t("native")}
            title=${this.t("native")}
            @click=${()=>this.native(i.entity_id)}
          >
            <ha-icon icon="mdi:open-in-new"></ha-icon>
          </button>
        </div>
        <label class="check"
          ><input
            type="checkbox"
            .checked=${i.enabled}
            ?disabled=${l}
            @change=${p=>this.command(e,"automation",p.target.checked)}
          />${this.t("enabled")}</label
        >
      </div>

      ${o?.speed?d`<label class="speed-control"
            >${this.t("speed")}<input
              aria-label=${this.t("speed")}
              type="range"
              min=${Math.max(1,Math.floor(o.step))}
              max="100"
              step=${Math.max(1,Math.floor(o.step))}
              .value=${String(a.percentage||i.speed_min)}
              ?disabled=${l||!o.available}
              @change=${p=>this.command(e,"set_percentage",Number(p.target.value))}
          /></label>`:c}
      <div class="metrics">
        ${this.metric("indoorTemperature",r?.temperature," \xB0C")}${this.metric("indoorHumidity",r?.humidity," %")}${h?this.metric("start",h.on,i.mode==="temperature"?" \xB0C":" %"):c}${h?this.metric("rest",h.off,i.mode==="temperature"?" \xB0C":" %"):c}
      </div>
      ${h?.fallback?d`<p class="help">${this.t("fallback")}</p>`:c}
      ${i.mode==="humidity"?d`<details>
            <summary>${this.t("sources")}</summary>
            <p class="help">${this.t("algorithmHelp")}</p>
            <div class="metrics">
              ${this.metric("outdoorTemperature",r?.outdoor_temperature," \xB0C")}${this.metric("outdoorHumidity",r?.outdoor_humidity," %")}${this.metric("outdoorEquivalent",h?.outdoor_equivalent," %")}
            </div>
            ${Object.entries(r?.sources??{}).filter(([p])=>p.startsWith("outdoor")).map(([p,m])=>d`<p class="help entity-name">
                    ${this.t(p==="outdoor_temperature"?"outdoorTemperature":"outdoorHumidity")}:
                    ${m??"\u2014"}
                  </p>`)}
          </details>`:c}
      ${o?.speed&&a.target_percentage!=null?d`<p class="help">
            ${this.t("target")}: ${a.target_percentage}% ·
            ${this.t("step")}: ${o.step.toFixed(1)}%
          </p>`:c}
    </article>`}fans(e){let i=new Set(Object.values(this.draft.config.rooms).flatMap(n=>Object.values(n.ventilations).map(o=>o.entity_id))),a=(this.snapshot?.entities??[]).filter(n=>n.domain==="fan"&&!i.has(n.entity_id)&&(this.otherRooms||!n.area_id||n.area_id===this.roomId));return d`<section class="card">
        <h3>${this.t("addVentilation")}</h3>
        ${this.picker("fan",null,a,n=>{if(n){let o=this.snapshot?.entities.find(l=>l.entity_id===n);e.ventilations[Me()]=ze(n,o?.name??n),this.resetKey++}})}<label class="check"
          ><input
            type="checkbox"
            .checked=${this.otherRooms}
            @change=${n=>{this.otherRooms=n.target.checked}}
          />${this.t("otherRooms")}</label
        >
      </section>
      ${Object.entries(e.ventilations).map(([n,o])=>{let l=this.snapshot?.entities.find(r=>r.entity_id===o.entity_id)?.capabilities;return d`<section class="card">
          <div class="field-grid">
            <label
              >${this.t("name")}<input
                maxlength="100"
                .value=${o.name}
                @input=${r=>{o.name=r.target.value,this.touch()}}
            /></label>
            <div>
              <small>${this.t("capabilities")}</small>
              <p>
                ${l?.speed?this.t("variableSpeed"):this.t("onOffOnly")}
              </p>
            </div>
          </div>
          <p class="help entity-name">${o.entity_id}</p>
          ${l?.presets?d`<p class="help">${this.t("presetsHelp")}</p>`:c}
          ${this.removeId===n?d`<p>${this.t("removeHelp")}</p>
                <div class="row">
                  <button
                    class="danger"
                    @click=${()=>{delete e.ventilations[n],this.removeId="",this.touch()}}
                  >
                    ${this.t("confirm")}</button
                  ><button
                    @click=${()=>{this.removeId=""}}
                  >
                    ${this.t("cancel")}
                  </button>
                </div>`:d`<button
                class="danger"
                @click=${()=>{this.removeId=n}}
              >
                ${this.t("remove")}
              </button>`}
        </section>`})}`}automation(e){return d`<section class="card">
        <h3>${this.t("sensors")}</h3>
        <div class="field-grid">
          ${this.picker("indoorTemperature",e.temperature_entity_id,this.sensorEntities("temperature"),i=>{e.temperature_entity_id=i})}${this.picker("indoorHumidity",e.humidity_entity_id,this.sensorEntities("humidity"),i=>{e.humidity_entity_id=i})}
        </div>
      </section>
      ${Object.entries(e.ventilations).map(([i,a])=>{let n=this.snapshot?.entities.find(o=>o.entity_id===a.entity_id)?.capabilities;return d`<section class="card" data-settings=${i}>
          <h3>${a.name||a.entity_id}</h3>
          <label class="check"
            ><input
              type="checkbox"
              .checked=${a.enabled}
              @change=${o=>{a.enabled=o.target.checked,this.touch()}}
            />${this.t("enabled")}</label
          >
          <label
            >${this.t("mode")}<select
              .value=${a.mode}
              @change=${o=>this.navigate(()=>{a.mode=o.target.value,this.touch()})}
            >
              <option value="temperature">${this.t("temperature")}</option>
              <option value="humidity">${this.t("humidity")}</option>
            </select></label
          >
          <h4>${this.t("thresholds")}</h4>
          <div class="field-grid">
            ${a.mode==="temperature"?d`${this.number(a,"temperature_on",-40,60)}${this.number(a,"temperature_off",-40,60)}${n?.speed?this.number(a,"temperature_full",-40,60):c}`:d`${this.number(a,"humidity_on",20,90)}${this.number(a,"humidity_hysteresis",1,20)}${n?.speed?this.number(a,"humidity_full",21,100):c}`}
          </div>
          ${a.mode==="humidity"?d`<p class="help">${this.t("algorithmHelp")}</p>
                <label class="check"
                  ><input
                    type="checkbox"
                    data-field="humidity_timeout_enabled"
                    .checked=${a.humidity_timeout_enabled}
                    @change=${o=>{a.humidity_timeout_enabled=o.target.checked,this.touch()}}
                  />${this.t("humidity_timeout_enabled")}</label
                >
                <p class="help">${this.t("humidityTimeoutHelp")}</p>
                ${a.humidity_timeout_enabled?d`<div class="field-grid">
                      ${this.number(a,"humidity_timeout",1,1440,60)}
                    </div>`:c}`:c}
          ${n?.speed?d`<details>
                <summary>${this.t("speeds")}</summary>
                <p class="help">${this.t("backgroundHelp")}</p>
                <label class="check"
                  ><input
                    type="checkbox"
                    .checked=${a.background>0}
                    @change=${o=>{a.background=o.target.checked?Math.min(20,a.speed_min-1):0,this.touch()}}
                  />${this.t("backgroundEnabled")}</label
                >
                <div class="field-grid">
                  ${a.background>0?this.number(a,"background",1,99):c}${this.number(a,"speed_min",1,100)}${this.number(a,"speed_max",1,100)}
                </div>
              </details>`:d`<p class="help">
                ${this.t("onOffOnly")}${a.background?` \xB7 ${this.t("speed_unsupported")}`:""}
              </p>`}
          <details>
            <summary>${this.t("timings")}</summary>
            <div class="field-grid">
              ${this.number(a,"min_on",0,86400)}${this.number(a,"min_off",0,86400)}${this.number(a,"manual_pause",0,86400)}
            </div>
          </details>
        </section>`})}`}roomView(){let e=this.draft.config.rooms[this.roomId],i=this.snapshot?.areas.find(n=>n.id===this.roomId)?.name??this.roomId;if(!this.roomId)return d`<div class="empty-state welcome">
        <ha-icon icon="mdi:fan"></ha-icon>
        <h2 class="view-title" tabindex="-1">${this.t("chooseRoom")}</h2>
        <p>${this.t("chooseRoomHelp")}</p>
        ${this.snapshot?.admin?c:d`<p class="help">${this.t("readonly")}</p>`}
      </div>`;let a=this.snapshot?.admin?["control","ventilations","automation","settings"]:["control"];return d`<div class="room-heading">
        <button
          class="icon-button back back-button"
          aria-label=${this.t("back")}
          @click=${()=>this.navigate(()=>{this.roomId=""})}
        >
          <ha-icon icon="mdi:arrow-left"></ha-icon>
        </button>
        <h2 class="view-title grow" tabindex="-1">${i}</h2>
      </div>
      ${e?d`<div class="room-summary">
              <span class="badge"
                >${this.roomState(this.roomId).description}</span
              ><span class="badge"
                >${Object.keys(e.ventilations).length}
                ${this.t(Object.keys(e.ventilations).length===1?"ventilationCount":"ventilationsCount")}</span
              >
            </div>
            <nav class="room-tabs tabs" role="tablist" aria-label=${i}>
              ${a.map(n=>d`<button
                    role="tab"
                    id=${`tab-${n}`}
                    aria-selected=${String(this.tab===n)}
                    aria-controls="room-panel"
                    tabindex=${this.tab===n?0:-1}
                    @click=${()=>this.navigate(()=>{this.tab=n})}
                    @keydown=${o=>{let l=a.indexOf(this.tab),r=o.key==="ArrowRight"?(l+1)%a.length:o.key==="ArrowLeft"?(l+a.length-1)%a.length:o.key==="Home"?0:o.key==="End"?a.length-1:-1;r>=0&&(o.preventDefault(),this.navigate(()=>{this.tab=a[r]}),this.updateComplete.then(()=>this.renderRoot.querySelector(`#tab-${this.tab}`)?.focus()))}}
                  >
                    ${this.t(n)}
                  </button>`)}
            </nav>
            <div
              id="room-panel"
              class="room-panel"
              role="tabpanel"
              aria-labelledby=${`tab-${this.tab}`}
            >
              ${this.tab==="control"?d`${Object.entries(e.ventilations).map(([n,o])=>this.controller(n,o))}${Object.keys(e.ventilations).length?c:d`<p class="muted">${this.t("noVentilations")}</p>
                        ${this.snapshot?.admin?d`<button
                              @click=${()=>{this.tab="ventilations"}}
                            >
                              ${this.t("addVentilation")}
                            </button>`:c}`}`:this.tab==="ventilations"?this.fans(e):this.tab==="automation"?this.automation(e):d`<section class="card">
                        <h3>${this.t("removeRoom")}</h3>
                        <p class="help">${this.t("removeHelp")}</p>
                        ${this.removeId==="room"?d`<div class="row">
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
                            </div>`:d`<button
                              class="danger"
                              @click=${()=>{this.removeId="room"}}
                            >
                              ${this.t("removeRoom")}
                            </button>`}
                      </section>`}
            </div>`:d`<div class="empty-state">
            <ha-icon icon="mdi:fan"></ha-icon>
            <h3>${this.t("unconfigured")}</h3>
            <p>${this.t("configureRoomHelp")}</p>
            ${this.snapshot?.admin?d`<button
                  class="primary"
                  @click=${()=>{this.draft.config.rooms[this.roomId]=Oe(),this.tab="ventilations",this.touch()}}
                >
                  ${this.t("configureRoom")}
                </button>`:d`<p class="help">${this.t("readonly")}</p>`}
          </div>`}`}generalView(){let e=this.draft.config;return d`<div class="global-settings settings-list">
      <h2 class="view-title" tabindex="-1">${this.t("general")}</h2>
      <section class="settings-group">
        <h3>${this.t("sources")}</h3>
        <p class="help">${this.t("sourceHelp")}</p>
        ${this.picker("weather",e.weather_entity_id,(this.snapshot?.entities??[]).filter(i=>i.domain==="weather"),i=>{e.weather_entity_id=i})}${this.picker("outdoorTemperature",e.outdoor_temperature_entity_id,this.sensorEntities("temperature"),i=>{e.outdoor_temperature_entity_id=i})}${this.picker("outdoorHumidity",e.outdoor_humidity_entity_id,this.sensorEntities("humidity"),i=>{e.outdoor_humidity_entity_id=i})}
      </section>
    </div>`}render(){let e=(this.narrow||this.hass?.dockedSidebar==="always_hidden")&&!this.hass?.kioskMode&&this.hass?.auth?.external?.config?.hasSidebar!==!0,i=this.snapshot?.areas??[],a=[...i,...Object.keys(this.draft.config.rooms).filter(o=>!i.some(l=>l.id===o)).map(o=>({id:o,name:o}))].sort((o,l)=>+!!this.draft.config.rooms[l.id]-+!!this.draft.config.rooms[o.id]),n=a.filter(o=>se({entity_id:o.id,name:o.name},this.query));return d`<div class="shell" lang=${oe(this.locale)}>
      <header class="app-header">
        <div class="brand" title=${this.t("intro")}>
          ${e?d`<button
                class="icon-button sidebar-toggle"
                type="button"
                aria-label=${this.t("openSidebar")}
                title=${this.t("openSidebar")}
                @click=${()=>this.dispatchEvent(new CustomEvent("hass-toggle-menu",{detail:{open:!0},bubbles:!0,composed:!0}))}
              ><ha-icon icon="mdi:menu" aria-hidden="true"></ha-icon></button>`:c}
          <ha-icon icon="mdi:fan"></ha-icon>
          <h1 aria-label=${`Havo \u2014 ${this.t("intro")}`}>Havo</h1>
        </div>
        <nav class="top-nav" aria-label="Havo">
          <button
            aria-current=${this.general?c:"page"}
            @click=${()=>this.navigate(()=>{this.general=!1})}
          >
            ${this.t("rooms")}
          </button>
          ${this.snapshot?.admin?d`<button
                aria-current=${this.general?"page":c}
                @click=${()=>this.navigate(()=>{this.general=!0})}
              >
                ${this.t("general")}
              </button>`:c}
        </nav>
      </header>
      <div class="content">
        <main>
          ${this.error||this.draft.conflict?d`<div role="alert" class="notice error">
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                <span class="grow"
                  >${this.t(this.draft.conflict?"conflict":this.error)}</span
                >
              </div>`:c}
          ${this.message?d`<div class="notice" role="status">
                <ha-icon icon="mdi:check-circle-outline"></ha-icon>${this.t(this.message)}
              </div>`:c}
          ${this.snapshot?c:d`<p class="notice" role="status">
                ${this.t("disconnected")}
              </p>`}
          ${Te(this.resetKey,this.general&&this.snapshot?.admin?this.generalView():d`<div
                  class="workspace layout ${this.roomId?"has-room":""}"
                >
                  <aside class="room-rail" aria-label=${this.t("rooms")}>
                    <div class="rail-heading">
                      <h2 tabindex="-1">${this.t("rooms")}</h2>
                      <span class="count">${a.length}</span>
                    </div>
                    <label class="rail-search"
                      ><span>${this.t("search")}</span
                      ><input
                        type="search"
                        .value=${this.query}
                        @input=${o=>{this.query=o.target.value}}
                    /></label>
                    <div class="room-list">
                      ${n.map(o=>{let l=this.roomState(o.id),r=this.roomCommand(o.id);return d`<div
                          class="room-item"
                          ?data-active=${this.roomId===o.id}
                          data-state=${l.unavailable?"unavailable":l.on?"on":"off"}
                        >
                          <button
                            class="room-link room"
                            aria-label=${o.name}
                            aria-current=${this.roomId===o.id?"page":c}
                            @click=${()=>this.navigate(()=>{this.roomId=o.id,this.otherRooms=!1,this.tab="control"})}
                          >
                            <ha-icon
                              icon=${l.room?l.on?"mdi:fan":"mdi:fan-off":"mdi:plus-circle-outline"}
                            ></ha-icon>
                            <span
                              ><strong>${o.name}</strong
                              ><small class="room-meta"
                                >${l.room?`${l.entries.length} ${this.t(l.entries.length===1?"ventilationCount":"ventilationsCount")} \xB7 ${l.description}`:this.t("unconfigured")}</small
                              ></span
                            >
                          </button>
                          ${l.room?d`<button
                                class="icon-button quick-toggle"
                                aria-pressed=${String(l.on)}
                                aria-label=${`${this.t(l.on?"turnOff":"turnOn")} \xB7 ${o.name}`}
                                title=${this.t(l.on?"turnOff":"turnOn")}
                                ?disabled=${!r.allowed}
                                @click=${()=>this.toggleRoom(o.id)}
                              >
                                <ha-icon icon="mdi:power"></ha-icon>
                              </button>`:c}
                        </div>`})}
                    </div>
                    ${a.length?c:d`<p class="empty">${this.t("noRooms")}</p>`}
                    ${a.length&&!n.length?d`<p class="empty" role="status">
                          ${this.t("noRoomsMatch")}
                        </p>`:c}
                  </aside>
                  <div class="room-detail">${this.roomView()}</div>
                </div>`)}
        </main>
      </div>
      ${this.draft.dirty&&this.snapshot?.admin?d`<footer class="savebar" role="status">
            <span class="grow">${this.t("unsaved")}</span>
            <button ?disabled=${this.saving} @click=${this.discard}>
              ${this.t("discard")}
            </button>
            <button
              class="primary"
              ?disabled=${this.saving||this.draft.conflict}
              @click=${this.save}
            >
              ${this.t(this.saving?"saving":"save")}
            </button>
          </footer>`:c}
    </div>`}};customElements.define("havo-panel",re);export{re as HavoPanel};
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
