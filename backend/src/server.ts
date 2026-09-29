import { z } from 'zod';
import { app } from './app.js';

const port = z.coerce.number().int().min(1).max(65535).default(3000).parse(process.env.PORT);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
