"""NumPy による独立検証。外部のテストフレームワークは不要。"""
import json
import pathlib
import subprocess
import sys
import numpy as np

base = pathlib.Path(__file__).resolve().parent
cases = json.loads((base / 'cases.json').read_text(encoding='utf-8'))
actual = json.loads(subprocess.check_output(['node', str(base / 'run_js.js')], encoding='utf-8'))
failures = 0
for case, result in zip(cases, actual):
    try:
        points = np.array([[float(p['x']), float(p['y'])] for p in case['points']], dtype=float)
        x, y = points[:, 0], points[:, 1]
        origin = case.get('origin', False)
        invalid = len(x) < (1 if origin else 2)
        if origin:
            invalid |= np.sum(x*x) == 0
        else:
            invalid |= np.sum((x-x.mean())**2) <= 1e-14*np.sum(x*x)
        if invalid:
            assert result['errors']
            assert all(v is None for v in result['x_unknowns'])
        else:
            # Centering before lstsq avoids loss of intercept precision at large offsets.
            if origin:
                a = np.linalg.lstsq(x[:, None], y, rcond=None)[0][0]
                b = 0.0
            else:
                a, centered_b = np.linalg.lstsq(np.column_stack((x-x.mean(), np.ones(len(x)))), y-y.mean(), rcond=None)[0]
                b = y.mean() + centered_b - a*x.mean()
            den = np.sum(y*y) if origin else np.sum((y-y.mean())**2)
            r2 = None if den == 0 else 1 - np.sum((y-(a*x+b))**2)/den
            # The exact constant-Y solution has slope zero; discard lstsq roundoff.
            flat = np.ptp(y) == 0 and not origin or abs(a)*(np.max(np.abs(x)) if origin else np.ptp(x)) <= 1e-9*np.max(np.abs(y))
            if np.ptp(y) == 0 and not origin:
                a, b = 0.0, float(y[0])
            for label, expected in [('a', a), ('b', b), ('r2', r2)]:
                observed = result[label]
                if expected is None:
                    assert observed is None, label
                else:
                    np.testing.assert_allclose(observed, expected, rtol=1e-10, atol=1e-12, err_msg=label)
            for yy, observed in zip(case['unknowns'], result['x_unknowns']):
                if flat:
                    assert observed is None
                else:
                    np.testing.assert_allclose(observed, (yy-b)/a, rtol=1e-10, atol=1e-12)
        print('PASS: ' + case['name'])
    except Exception as exc:
        failures += 1
        print('FAIL: ' + case['name'] + ': ' + str(exc))
print(f'{len(cases)-failures}/{len(cases)} PASS (NumPy {np.__version__})')
sys.exit(1 if failures else 0)
