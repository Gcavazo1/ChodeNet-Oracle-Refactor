// Stubbed animation helpers after removing animejs / OracleAnimations
// Each function does nothing; replace with framer-motion or CSS later.

export const oracleAnimations = {
  initializeDashboard: (..._args: any[]) => {},
  animateOracleEyeState: (..._args: any[]) => {},
  cleanup: (..._args: any[]) => {},
  triggerDashboardWave: (..._args: any[]) => {}
};

export const useOracleAnimations = () => {
  const noop = (..._args: any[]) => {};
  return {
    animateAlertClick: noop,
    createMetricCardRipple: noop,
    animateMetricCardFocus: noop,
    animateMetricCardBlur: noop,
    animateCardHover: noop,
    animateCardLeave: noop,
    animateCardClick: noop
  };
}; 