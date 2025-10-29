type SocialType = 'google' | 'apple' | 'facebook';

export const useSocialButton = () => {
  const getIconStyle = (type: SocialType) => {
    // This can be extended to handle more complex icon logic in the future
    return type;
  };

  return {
    getIconStyle,
  };
};
