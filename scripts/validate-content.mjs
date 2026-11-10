import { validateAll } from '../cms/render.mjs';
import { models } from '../cms/model.mjs';

try {
  validateAll();
  console.log(`Validated all ${models.length} Pages CMS content files and their media.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
