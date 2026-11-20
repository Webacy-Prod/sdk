# Asserts after.json / before-1.10.0.json against the captured bodies (expected values come from the files, not typed in).
import json, math, sys, datetime
cap, w = sys.argv[1], sys.argv[2]
after = {r['case']: r for r in json.load(open(f'{w}/after.json'))}
before = {r['case']: r for r in json.load(open(f'{w}/before-1.10.0.json'))}
rows = []
def check(name, expected, actual):
    rows.append({'check': name, 'expected': expected, 'actual': actual, 'pass': expected == actual})
for case in ['cu-limit', 'quota', 'perapi-quota']:
    d = json.load(open(f'{cap}/{case}.body.json'))['details']
    a = after[case]
    reset = math.ceil(datetime.datetime.fromisoformat(d['resetAt'].replace('Z', '+00:00')).timestamp())
    for k in ['limitType', 'limit', 'currentUsage', 'upgradeUrl']:
        check(f'after {case} {k}', d.get(k), a.get(k))
    check(f'after {case} resetAt', reset, a['resetAt'])
    check(f'after {case} requests (no retry)', 1, a['requests'])
    check(f'after {case} isRetryable', False, a['isRetryable'])
    check(f'before {case} requests (1 + 3 retries)', 4, before[case]['requests'])
check('after rate requests', 2, after['rate']['requests'])
check('after rate waited 1000-1500 ms', True, 1000 <= after['rate']['msBetweenRequests'][0] < 1500)
check('after rate result', 'success', after['rate']['result'])
check('after rate+2s waited 2000-2500 ms', True, 2000 <= after['rate-resetAt-plus-2s']['msBetweenRequests'][0] < 2500)
check('before rate+2s waited < 2000 ms (ignored resetAt)', True, before['rate-resetAt-plus-2s']['msBetweenRequests'][0] < 2000)
check('after gateway requests (1 + 3 retries)', 4, after['gateway-per-key']['requests'])
check('after gateway isRetryable', True, after['gateway-per-key']['isRetryable'])
check('after gateway limitType', None, after['gateway-per-key'].get('limitType'))
json.dump({'rows': rows, 'failed': [r['check'] for r in rows if not r['pass']]}, open(f'{w}/verify.json', 'w'), indent=2)
print(f"{sum(r['pass'] for r in rows)}/{len(rows)} pass; failed: {[r['check'] for r in rows if not r['pass']]}")
