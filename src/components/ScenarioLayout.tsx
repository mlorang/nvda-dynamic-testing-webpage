import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useScenarioParams } from '../hooks/useScenarioParams';
import { CATEGORY_TITLES } from '../scenarios/registry.data';
import { Scenario } from '../scenarios/registry';
import { SiteHeader } from './SiteHeader';

export function ScenarioLayout({ scenario }: { scenario: Scenario }) {
  const { variant, delay } = useScenarioParams(scenario.defaultDelay);
  const [params] = useSearchParams();
  const [resetCount, setResetCount] = useState(0);
  const other = variant === 'accessible' ? 'broken' : 'accessible';

  useEffect(() => {
    document.title = `${scenario.title} (${variant}) – NVDA test page`;
  }, [scenario.title, variant]);

  const toggleParams = new URLSearchParams(params);
  toggleParams.set('variant', other);

  const Component = variant === 'accessible' ? scenario.Accessible : scenario.Broken;

  return (
    <>
      <SiteHeader />
      <main id="main" className="page">
        <Link to="/" className="back-link" data-testid="back-to-index">
          <span aria-hidden="true">← </span>Back to all scenarios
        </Link>
        <p className="eyebrow">{CATEGORY_TITLES[scenario.category]}</p>
        <h1>{scenario.title}</h1>
        <p>{scenario.description}</p>
        <div className={`variant-bar variant-${variant}`} data-testid="variant-bar">
          <p>
            Variant: <strong data-testid="variant">{variant}</strong>
            {variant === 'broken' && <> — {scenario.flaw}</>}
          </p>
          <div className="row">
            <Link to={{ search: `?${toggleParams}` }} data-testid="toggle-variant">
              Switch to {other} variant
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              data-testid="reset"
              onClick={() => setResetCount((n) => n + 1)}
            >
              Reset scenario
            </button>
          </div>
        </div>
        <div
          className="scenario"
          data-testid="scenario-root"
          data-scenario={scenario.id}
          data-variant={variant}
          data-delay={delay}
        >
          <Component key={`${variant}-${delay}-${resetCount}`} delay={delay} />
        </div>
      </main>
    </>
  );
}
