let now = new Date()
let then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 30)
let days = (now - then) / 36e5 / 24
let liquidity = 482.67
let fee = 1.89
let grossReturn = Math.round((fee / liquidity + 1) ** (1 / (days / 365)))
console.log(grossReturn);