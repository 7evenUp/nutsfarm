const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="15" cy="15" r="15" fill="currentColor" />
      <path
        d="M12.2542 22.4374C12.6844 22.8866 13.286 23.1437 14.0091 23.1437H14.0114C14.6662 23.12 15.283 22.7997 15.7003 22.2697L23.4696 12.551C24.2807 11.5363 24.1494 10.0028 23.1608 9.1209C22.1676 8.27856 20.6988 8.4225 19.8824 9.44043L13.7473 17.1162L10.8457 14.0789C9.93529 13.1282 8.45124 13.1282 7.54073 14.0789C6.62949 15.0288 6.62949 16.5742 7.54073 17.5241L12.2542 22.4374Z"
        fill="#050D12"
      />
    </svg>
  )
}

export default CheckIcon
