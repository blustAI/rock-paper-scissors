import{k as l,r as g,j as x,M as d,T as j,u as e,H as p,B as T,A as f,d as w,c as S,R as y}from"./index-DiUrmAau.js";const L=A=>{const{searchParams:n,setSearchParams:v}=l(),[a,r]=g.useState(),t=n.get("code"),{provider:c}=x(),{oauthLogin:m,user:i}=d(),s=j(),{getStorageItem:u}=y(),h=async()=>{if(r(null),n.get("error")&&(r(a),setTimeout(()=>{s("/login")},5e3)),!t)r("Something went wrong..."),setTimeout(()=>{s("/login")},5e3);else try{await m(c,t),setTimeout(()=>{s(u("oauth_redirect")||"/")},300)}catch(o){console.log("oauth-error",o),r(o.error||o.message||"Something went wrong..."),setTimeout(()=>{s("/login")},5e3)}};return g.useEffect(()=>{t?h():r("Authentication error")},[t]),e.jsxs(e.Fragment,{children:[e.jsx(p,{}),e.jsx(T,{sx:{marginTop:16,marginLeft:5,marginRight:5},children:a?e.jsx(f,{children:a}):e.jsxs(e.Fragment,{children:[e.jsx(w,{}),i&&e.jsxs(S,{variant:"caption",children:["Logging user: ",i.username]})]})})]})};export{L as default};
