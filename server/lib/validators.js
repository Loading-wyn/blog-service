
export const RE_SPECIAL_CHAR = /[^0-9a-zA-Z\u4e00-\u9fa5]/;
export const RE_CHN_CHAR = /[\u4e00-\u9fa5]/g;
export const RE_COMMA_SEPARATOR = /\s*[,\uFF0C]\s*/;
export const stringLengthByDoubleByte = value => {
  return (
    value.replace(RE_CHN_CHAR, 'xx') || ''
  ).length / 2;
};

export const isUsername = value => {
  return !/\W/.test(value);
};

export const isPassword = value => {
  const hasLowerCase = /[a-z]/.test(value);
  const hasUpperCase = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasChar = /[\W_]/.test(value);
  const length = value.length;
  if (length < 8) {
    return false;
  }
  let count = 0;
  if (hasLowerCase) {
    count++;
  }
  if (hasUpperCase) {
    count++;
  }
  if (hasNumber) {
    count++;
  }
  if (hasChar) {
    count++;
  }
  return count >= 3;
};
