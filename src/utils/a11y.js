/** aria-describedby value matching the ids <Field> gives its error/hint text. */
export const describedBy = (id, { error, hint } = {}) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
