import { routes } from '@stricjs/app';
import { text, json } from '@stricjs/app/send';

export default routes()
  .get("/animes/:page", (ctx) => {
    const {page} = ctx.params;
    
    
  })
