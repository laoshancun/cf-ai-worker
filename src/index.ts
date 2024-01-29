import { Ai } from '@cloudflare/ai';
import {
	error, // creates error responses
	json, // creates JSON responses
	Router, // the ~440 byte router itself
} from 'itty-router';
// Create a new router
const router = Router();

export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "AI" with the variable name you defined.
	AI: any;
	API_KEYS: string;
}

router.get('/', () => {
	return new Response('Hello, world! This is the root page of your Worker template.');
});

// a middleware that *might* return
const checkApiKey = (request: Request, env: Env) => {
	const auth = request.headers.get('Authorization');
	if (env.API_KEYS && !env.API_KEYS.split(',').find((s) => s === auth)) {
		return error(401, 'Authorization is required');
	}
};

router.post('/v1/completion', checkApiKey, async (request, env) => {
	// Create a base object with some fields.
	const ai = new Ai(env.AI);
	if (request.headers.get('Content-Type') !== 'application/json') {
		return new Response('400, bad request!', { status: 400 });
	}
	let inputs = await request.json();
	if (!inputs.hasOwnProperty('prompt')) {
		return new Response('prompt is required!', { status: 400 });
	}

	let response = await ai.run('@cf/meta/llama-2-7b-chat-int8', inputs);

	return Response.json(response, {
		headers: {
			'Content-Type': 'application/json',
		},
	});
});

router.post('/v1/chat/completion', async (request, env) => {
	// Create a base object with some fields.
	const ai = new Ai(env.AI);
	if (request.headers.get('Content-Type') !== 'application/json') {
		return new Response('400, bad request!', { status: 400 });
	}
	let data = await request.json();
	if (!Array.isArray(data['messages']) || data['messages'].length < 1) {
		return new Response('messages must be array!', { status: 400 });
	}

	let response = await ai.run('@cf/meta/llama-2-7b-chat-int8', data);

	return Response.json(response, {
		headers: {
			'Content-Type': 'application/json',
		},
	});
});

router.post('/v1/images/generations', async (request, env) => {
	// Create a base object with some fields.
	const ai = new Ai(env.AI);
	if (request.headers.get('Content-Type') !== 'application/json') {
		return new Response('400, bad request!', { status: 400 });
	}
	let inputs = await request.json();
	if (!inputs.hasOwnProperty('prompt')) {
		return new Response('prompt is required!', { status: 400 });
	}

	const response = await ai.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs);

	return new Response(response, {
		headers: {
			'content-type': 'image/png',
		},
	});
});

router.all('*', () => new Response('404, not found!', { status: 404 }));

export default {
	fetch: (request: Request, env: Env, ctx: any) => router.handle(request, env, ctx).then(json).catch(error),
};
