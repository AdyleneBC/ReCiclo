export function LogoReCiclo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Aro superior de economía circular */}
      <path
        d="M8.5 18.5C9.3 12.1 14.7 7.2 21.3 7.2C25.6 7.2 29.4 9.3 31.8 12.5"
        stroke="#6E9167"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M32.2 8.4L32.4 13.1L27.7 12.7"
        stroke="#6E9167"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Aro inferior de retorno */}
      <path
        d="M31.5 21.5C30.7 27.9 25.3 32.8 18.7 32.8C14.4 32.8 10.6 30.7 8.2 27.5"
        stroke="#6E9167"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M7.8 31.6L7.6 26.9L12.3 27.3"
        stroke="#6E9167"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hoja central minimalista */}
      <path
        d="M20 13.5C24.2 13.5 26.8 16.5 26.8 20.3C26.8 23.9 23.9 26.5 20 26.5C16.1 26.5 13.2 23.9 13.2 20.3C13.2 16.5 15.8 13.5 20 13.5Z"
        fill="#F1F5F0"
        stroke="#6E9167"
        strokeWidth="2"
      />
      <path
        d="M20 26.2V16.8M20 21.5L23.2 18.8"
        stroke="#6E9167"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
