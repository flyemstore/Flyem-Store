const disposableDomains = [
    "yopmail.com",
    "guerrillamail.com",
    "10minutemail.com",
    "sharklasers.com",
    "mailinator.com",
    "temp-mail.org",
    "tempmail.com",
    "throwawaymail.com",
    "getairmail.com",
    "maildrop.cc",
    "nopmail.com",
    "dispostable.com"
    // You can add more domains here as you find them
];

export const isDisposable = (email) => {
    if (!email || !email.includes('@')) return false;
    const domain = email.split('@')[1].toLowerCase();
    return disposableDomains.includes(domain);
};