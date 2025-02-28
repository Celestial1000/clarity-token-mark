;; TokenMark Contract
;; Track token performance metrics

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-token-exists (err u101))
(define-constant err-token-not-found (err u102))
(define-constant err-invalid-price (err u103))

;; Data structures
(define-map tokens 
  { token-id: (string-ascii 32) }
  {
    issuer: principal,
    current-price: uint,
    initial-price: uint,
    timestamp: uint
  }
)

(define-map price-history
  { token-id: (string-ascii 32), timestamp: uint }
  { price: uint }
)

;; Public functions
(define-public (add-token (token-id (string-ascii 32)) (issuer principal) (initial-price uint))
  (if (is-eq tx-sender contract-owner)
    (if (map-get? tokens { token-id: token-id })
      err-token-exists
      (begin
        (map-set tokens 
          { token-id: token-id }
          {
            issuer: issuer,
            current-price: initial-price,
            initial-price: initial-price,
            timestamp: block-height
          }
        )
        (map-set price-history
          { token-id: token-id, timestamp: block-height }
          { price: initial-price }
        )
        (ok true)
      )
    )
    err-owner-only
  )
)

(define-public (update-price (token-id (string-ascii 32)) (new-price uint))
  (let ((token (map-get? tokens { token-id: token-id })))
    (if token
      (begin
        (map-set tokens
          { token-id: token-id }
          (merge token { current-price: new-price, timestamp: block-height })
        )
        (map-set price-history
          { token-id: token-id, timestamp: block-height }
          { price: new-price }
        )
        (ok true)
      )
      err-token-not-found
    )
  )
)

;; Read only functions
(define-read-only (get-token-info (token-id (string-ascii 32)))
  (ok (map-get? tokens { token-id: token-id }))
)

(define-read-only (get-performance (token-id (string-ascii 32)))
  (let ((token (map-get? tokens { token-id: token-id })))
    (if token
      (ok {
        initial-price: (get initial-price token),
        current-price: (get current-price token),
        return: (- (get current-price token) (get initial-price token))
      })
      err-token-not-found
    )
  )
)
