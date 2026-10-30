import assert from 'node:assert/strict';
import { articleHandler } from '../api/article.js';
import notFound from '../api/not-found.js';
const response = () => ({headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},end(body){this.body=body;return this;}});
const readTemplate = async () => '<div id="root"></div>';
for (const [exists, expected] of [[true,200],[false,404]]) {
 const res=response();await articleHandler({findPost:async()=>exists,readTemplate})({url:'/blog/example',method:'GET'},res);
 assert.equal(res.code,expected);
 if(expected===404)assert.equal(res.headers['X-Robots-Tag'],'noindex, follow');
 else assert.equal(res.headers['X-Robots-Tag'],undefined);
}
const failure=response();const original=console.error;console.error=()=>{};
try {await articleHandler({findPost:async()=>{throw Error('CMS down');},readTemplate})({url:'/blog/example',method:'GET'},failure);} finally {console.error=original;}
assert.equal(failure.code,503);assert.equal(failure.headers['Retry-After'],'300');assert.equal(failure.headers['X-Robots-Tag'],undefined);
const missing=response();notFound({method:'HEAD'},missing);assert.equal(missing.code,404);assert.equal(missing.body,undefined);
console.log('Valid article, missing article, CMS outage and HEAD checks passed.');
