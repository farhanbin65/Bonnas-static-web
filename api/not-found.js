import { notFoundHtml, respond } from '../server/http-pages.js';
export default function handler(req, res) {
  return respond(req, res, 404, notFoundHtml);
}
