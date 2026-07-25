export function GoogleGIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
      />
      <path
        fill="#FBBC05"
        d="M4.6 14.8c-.3-.9-.5-1.8-.5-2.8s.2-1.9.5-2.8L.9 6.3C.3 7.5 0 8.9 0 10.4s.3 2.9.9 4.1l3.7-2.9z"
      />
      <path
        fill="#4285F4"
        d="M23.5 10.4c0-.7-.1-1.4-.2-2H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-9z"
      />
      <path
        fill="#34A853"
        d="M12 19.8c3.2 0 6-1.1 8-2.9l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 13c1.8 3.7 5.6 6.8 10.1 6.8z"
      />
    </svg>
  )
}
