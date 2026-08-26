import type { ButtonHTMLAttributes, ReactNode } from 'react';

type CsButtonVariant = 'primary' | 'secondary' | 'ghost';

interface CsButtonBaseProps {
  variant?: CsButtonVariant;
  className?: string;
  showIcon?: boolean;
  children: ReactNode;
}

type CsButtonAsButton = CsButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined;
  };

type CsButtonAsLink = CsButtonBaseProps & {
  href: string;
};

export type CsButtonProps = CsButtonAsButton | CsButtonAsLink;

export function CsButton({
  variant = 'primary',
  className,
  showIcon = true,
  children,
  ...rest
}: CsButtonProps) {
  const classes = ['cs-button', `cs-button--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {showIcon && (
        <svg
          className="cs-button__icon"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path d="M2 1.2v9.6L11 6 2 1.2z" />
        </svg>
      )}
      <span className="cs-button__label">{children}</span>
    </>
  );

  if ('href' in rest && rest.href) {
    const { href } = rest;
    return (
      <a className={classes} href={href}>
        {content}
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = rest as CsButtonAsButton;
  return (
    <button className={classes} type={type} {...buttonProps}>
      {content}
    </button>
  );
}
