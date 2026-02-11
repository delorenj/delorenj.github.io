# Preview Checklist

Before pushing to production, review these items:

## Content Review

- [ ] **Hero positioning statement** - Does it feel right?
  - Current: "I build the infrastructure that makes AI agents actually work in production."
  
- [ ] **"Cult leader" narrative** - Tone check
  - Is it tasteful? (Goal: confident, not bitter)
  
- [ ] **33GOD description** - Technical accuracy
  - Yi Agent Framework, Flume, Bloodbank mentioned
  - "17+ microservices" accurate?
  
- [ ] **Intelliforia description** - Public details only
  - Is this ready to be public?
  
- [ ] **GOD Docs description** - Clear enough?
  
- [ ] **Contact email** - Confirm `jaradd@gmail.com` is correct

## Link Verification

- [ ] GitHub links work
  - https://github.com/delorenj/33GOD
  - https://github.com/delorenj/did-stuff
  - https://github.com/delorenj/prompt-and-tag
  - https://github.com/delorenj
  
- [ ] Social links work
  - https://linkedin.com/in/delorenj
  - https://x.com/CodeNDagger
  - https://me.dm/@delorenj
  - https://delorenj.substack.com
  - https://medium.com/@delorenj

## Visual Review

- [ ] Open `index.html` in browser
- [ ] Check mobile responsiveness (resize window)
- [ ] Verify dark mode looks good
- [ ] Test all section links (hero CTAs)
- [ ] Hover effects work on cards

## Optional Tweaks

Things you might want to adjust:

1. **Hero tagline** - Feel free to iterate
2. **Project descriptions** - Add/remove details
3. **Tech badges** - Add or remove technologies
4. **Color scheme** - Adjust accent colors in `assets/css/main.css`
   - `--accent-primary: #00ff88;` (green)
   - `--accent-secondary: #0088ff;` (blue)
5. **Fonts** - Currently using Inter + JetBrains Mono

## When You're Ready

```bash
cd ~/code/delorenj.github.io
git push origin main
```

Then visit https://delorenj.github.io in 1-2 minutes.

---

**Remember**: You can always revert if needed:
```bash
git revert HEAD
git push origin main
```

Or restore the old README:
```bash
cp README.old.md README.md
git add README.md
git commit -m "Restore old README"
git push origin main
```
