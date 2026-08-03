// Utility wrapping Express routes to bypass manual try-catch wrappers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
