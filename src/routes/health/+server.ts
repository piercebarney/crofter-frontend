import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const HEALTH_CHECK_TOKEN = 'adfY3LVU9egxZLMG601EHs/ipyNfMderPu34eA5LoVorcEfh6hVpLBB8rSc2HEnb';

export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('x-health-auth');

	if (authHeader !== `${HEALTH_CHECK_TOKEN}`) {
		throw error(401, 'Unauthorized');
	}

	return json({
		status: 'ok',
		timestamp: new Date().toISOString()
	});
};
