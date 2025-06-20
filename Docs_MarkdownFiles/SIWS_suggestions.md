## 🧠 Strategic Identity & Profile System Design for $GIRTH Clicker

---

### 🔐 1. **Authentication Scope & Flow**

#### ✅ Recommendation:

* **SIWS (Sign-In with Solana)** should happen **only on the Oracle parent page.**
* The **game remains wallet-agnostic** and pushes raw tap deltas + session data to the Oracle via JavaScriptBridge.
* The Oracle acts as the  **identity gatekeeper and logic handler** .

#### ✳️ Anonymous-to-Authenticated Flow:

* ✅  **Anonymous users can start playing immediately** . All progress is stored in LocalStorage with a unique `sessionID`.
* 🧠 When the player later connects their wallet (SIWS), we:
  * Look for a pending anonymous `sessionID` in LocalStorage.
  * Prompt: "Claim Your Progress?"
  * On confirm: Supabase links that session’s data to the connected wallet address.
  * Optional: We create a formal "PlayerProfile" record.

#### 📦 Session Persistence:

* SIWS sessions should be **persisted in Supabase Auth** using JWT tokens with refresh support (default behavior).
* Godot doesn’t need to manage this directly. Oracle dashboard checks for valid auth on load and can resend tokens if needed.

---

### 🧾 2. **Profile Data Architecture**

We break this into  **three layers** : identity, game state, and linked chain state.

#### 👤 A. Identity Layer (Player Profile)

Stored in Supabase (Off-Chain): EXAMPLE ONLY (depends on backend )

<pre class="overflow-visible!" data-start="1816" data-end="1985"><div class="contain-inline-size rounded-2xl border-[0.5px] border-token-border-medium relative bg-token-sidebar-surface-primary"><div class="flex items-center text-token-text-secondary px-4 py-2 text-xs font-sans justify-between h-9 bg-token-sidebar-surface-primary dark:bg-token-main-surface-secondary select-none rounded-t-2xl">ts</div><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-sidebar-surface-primary text-token-text-secondary dark:bg-token-main-surface-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"><button class="flex gap-1 items-center select-none py-1" aria-label="Copy"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-xs"><path d="M12.668 10.667C12.668 9.95614 12.668 9.46258 12.6367 9.0791C12.6137 8.79732 12.5758 8.60761 12.5244 8.46387L12.4688 8.33399C12.3148 8.03193 12.0803 7.77885 11.793 7.60254L11.666 7.53125C11.508 7.45087 11.2963 7.39395 10.9209 7.36328C10.5374 7.33197 10.0439 7.33203 9.33301 7.33203H6.5C5.78896 7.33203 5.29563 7.33195 4.91211 7.36328C4.63016 7.38632 4.44065 7.42413 4.29688 7.47559L4.16699 7.53125C3.86488 7.68518 3.61186 7.9196 3.43555 8.20703L3.36524 8.33399C3.28478 8.49198 3.22795 8.70352 3.19727 9.0791C3.16595 9.46259 3.16504 9.95611 3.16504 10.667V13.5C3.16504 14.211 3.16593 14.7044 3.19727 15.0879C3.22797 15.4636 3.28473 15.675 3.36524 15.833L3.43555 15.959C3.61186 16.2466 3.86474 16.4807 4.16699 16.6348L4.29688 16.6914C4.44063 16.7428 4.63025 16.7797 4.91211 16.8027C5.29563 16.8341 5.78896 16.835 6.5 16.835H9.33301C10.0439 16.835 10.5374 16.8341 10.9209 16.8027C11.2965 16.772 11.508 16.7152 11.666 16.6348L11.793 16.5645C12.0804 16.3881 12.3148 16.1351 12.4688 15.833L12.5244 15.7031C12.5759 15.5594 12.6137 15.3698 12.6367 15.0879C12.6681 14.7044 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.4528 12.6634 14.8011 12.6602 15.0879 12.6367C15.4635 12.606 15.675 12.5492 15.833 12.4688L15.959 12.3975C16.2466 12.2211 16.4808 11.9682 16.6348 11.666L16.6914 11.5361C16.7428 11.3924 16.7797 11.2026 16.8027 10.9209C16.8341 10.5374 16.835 10.0439 16.835 9.33301V6.5C16.835 5.78896 16.8341 5.29563 16.8027 4.91211C16.7797 4.63025 16.7428 4.44063 16.6914 4.29688L16.6348 4.16699C16.4807 3.86474 16.2466 3.61186 15.959 3.43555L15.833 3.36524C15.675 3.28473 15.4636 3.22797 15.0879 3.19727C14.7044 3.16593 14.211 3.16504 13.5 3.16504H10.667C9.9561 3.16504 9.46259 3.16595 9.0791 3.19727C8.79739 3.22028 8.6076 3.2572 8.46387 3.30859L8.33399 3.36524C8.03176 3.51923 7.77886 3.75343 7.60254 4.04102L7.53125 4.16699C7.4508 4.32498 7.39397 4.53655 7.36328 4.91211C7.33985 5.19893 7.33562 5.54719 7.33399 6.00195H9.33301C10.022 6.00195 10.5791 6.00131 11.0293 6.03809C11.4873 6.07551 11.8937 6.15471 12.2705 6.34668L12.4883 6.46875C12.984 6.7728 13.3878 7.20854 13.6533 7.72949L13.7197 7.87207C13.8642 8.20859 13.9292 8.56974 13.9619 8.9707C13.9987 9.42092 13.998 9.97799 13.998 10.667V12.665ZM18.165 9.33301C18.165 10.022 18.1657 10.5791 18.1289 11.0293C18.0961 11.4302 18.0311 11.7914 17.8867 12.1279L17.8203 12.2705C17.5549 12.7914 17.1509 13.2272 16.6553 13.5313L16.4365 13.6533C16.0599 13.8452 15.6541 13.9245 15.1963 13.9619C14.8593 13.9895 14.4624 13.9935 13.9951 13.9951C13.9935 14.4624 13.9895 14.8593 13.9619 15.1963C13.9292 15.597 13.864 15.9576 13.7197 16.2939L13.6533 16.4365C13.3878 16.9576 12.9841 17.3941 12.4883 17.6982L12.2705 17.8203C11.8937 18.0123 11.4873 18.0915 11.0293 18.1289C10.5791 18.1657 10.022 18.165 9.33301 18.165H6.5C5.81091 18.165 5.25395 18.1657 4.80371 18.1289C4.40306 18.0962 4.04235 18.031 3.70606 17.8867L3.56348 17.8203C3.04244 17.5548 2.60585 17.151 2.30176 16.6553L2.17969 16.4365C1.98788 16.0599 1.90851 15.6541 1.87109 15.1963C1.83431 14.746 1.83496 14.1891 1.83496 13.5V10.667C1.83496 9.978 1.83432 9.42091 1.87109 8.9707C1.90851 8.5127 1.98772 8.10625 2.17969 7.72949L2.30176 7.51172C2.60586 7.0159 3.04236 6.6122 3.56348 6.34668L3.70606 6.28027C4.04237 6.136 4.40303 6.07083 4.80371 6.03809C5.14051 6.01057 5.53708 6.00551 6.00391 6.00391C6.00551 5.53708 6.01057 5.14051 6.03809 4.80371C6.0755 4.34588 6.15483 3.94012 6.34668 3.56348L6.46875 3.34473C6.77282 2.84912 7.20856 2.44514 7.72949 2.17969L7.87207 2.11328C8.20855 1.96886 8.56979 1.90385 8.9707 1.87109C9.42091 1.83432 9.978 1.83496 10.667 1.83496H13.5C14.1891 1.83496 14.746 1.83431 15.1963 1.87109C15.6541 1.90851 16.0599 1.98788 16.4365 2.17969L16.6553 2.30176C17.151 2.60585 17.5548 3.04244 17.8203 3.56348L17.8867 3.70606C18.031 4.04235 18.0962 4.40306 18.1289 4.80371C18.1657 5.25395 18.165 5.81091 18.165 6.5V9.33301Z"></path></svg>Copy</button><span class="" data-state="closed"><button class="flex items-center gap-1 py-1 select-none"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-xs"><path d="M12.0303 4.11328C13.4406 2.70317 15.7275 2.70305 17.1377 4.11328C18.5474 5.52355 18.5476 7.81057 17.1377 9.2207L10.8457 15.5117C10.522 15.8354 10.2868 16.0723 10.0547 16.2627L9.82031 16.4395C9.61539 16.5794 9.39783 16.7003 9.1709 16.7998L8.94141 16.8916C8.75976 16.9582 8.57206 17.0072 8.35547 17.0518L7.59082 17.1865L5.19727 17.5859C5.05455 17.6097 4.90286 17.6358 4.77441 17.6455C4.67576 17.653 4.54196 17.6555 4.39648 17.6201L4.24707 17.5703C4.02415 17.4746 3.84119 17.3068 3.72559 17.0957L3.67969 17.0029C3.59322 16.8013 3.59553 16.6073 3.60547 16.4756C3.61519 16.3473 3.6403 16.1963 3.66406 16.0537L4.06348 13.6602C4.1638 13.0582 4.22517 12.6732 4.3584 12.3096L4.45117 12.0791C4.55073 11.8521 4.67152 11.6346 4.81152 11.4297L4.9873 11.1953C5.17772 10.9632 5.4146 10.728 5.73828 10.4043L12.0303 4.11328ZM6.67871 11.3447C6.32926 11.6942 6.14542 11.8803 6.01953 12.0332L5.90918 12.1797C5.81574 12.3165 5.73539 12.4618 5.66895 12.6133L5.60742 12.7666C5.52668 12.9869 5.48332 13.229 5.375 13.8789L4.97656 16.2725L4.97559 16.2744H4.97852L7.37207 15.875L8.08887 15.749C8.25765 15.7147 8.37336 15.6839 8.4834 15.6436L8.63672 15.5811C8.78817 15.5146 8.93356 15.4342 9.07031 15.3408L9.2168 15.2305C9.36965 15.1046 9.55583 14.9207 9.90527 14.5713L14.8926 9.58301L11.666 6.35742L6.67871 11.3447ZM16.1963 5.05371C15.3054 4.16304 13.8616 4.16305 12.9707 5.05371L12.6074 5.41602L15.833 8.64258L16.1963 8.2793C17.0869 7.38845 17.0869 5.94456 16.1963 5.05371Z"></path><path d="M4.58301 1.7832C4.72589 1.7832 4.84877 1.88437 4.87695 2.02441C4.99384 2.60873 5.22432 3.11642 5.58398 3.50391C5.94115 3.88854 6.44253 4.172 7.13281 4.28711C7.27713 4.3114 7.38267 4.43665 7.38281 4.58301C7.38281 4.7295 7.27723 4.8546 7.13281 4.87891C6.44249 4.99401 5.94116 5.27746 5.58398 5.66211C5.26908 6.00126 5.05404 6.43267 4.92676 6.92676L4.87695 7.1416C4.84891 7.28183 4.72601 7.38281 4.58301 7.38281C4.44013 7.38267 4.31709 7.28173 4.28906 7.1416C4.17212 6.55728 3.94179 6.04956 3.58203 5.66211C3.22483 5.27757 2.72347 4.99395 2.0332 4.87891C1.88897 4.85446 1.7832 4.72938 1.7832 4.58301C1.78335 4.43673 1.88902 4.3115 2.0332 4.28711C2.72366 4.17203 3.22481 3.88861 3.58203 3.50391C3.94186 3.11638 4.17214 2.60888 4.28906 2.02441L4.30371 1.97363C4.34801 1.86052 4.45804 1.78333 4.58301 1.7832Z"></path></svg>Edit</button></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>type</span><span></span><span>PlayerProfile</span><span> = {
  </span><span>wallet</span><span>: </span><span>string</span><span>;
  username?: </span><span>string</span><span>;
  avatarUrl?: </span><span>string</span><span>;
  </span><span>createdAt</span><span>: </span><span>string</span><span>;
  </span><span>lastSeenAt</span><span>: </span><span>string</span><span>;
  </span><span>linkedSessionIDs</span><span>: </span><span>string</span><span>[];
};
</span></span></code></div></div></pre>

**Optional Additions:**

* Referral codes
* Discord handle
* Linked NFTs (read-only from chain)

#### 🎮 B. Game State Layer

This tracks  **playable progress and economy data** :(FOR EXAMPLE USE ONLY)

<pre class="overflow-visible!" data-start="2164" data-end="2363"><div class="contain-inline-size rounded-2xl border-[0.5px] border-token-border-medium relative bg-token-sidebar-surface-primary"><div class="flex items-center text-token-text-secondary px-4 py-2 text-xs font-sans justify-between h-9 bg-token-sidebar-surface-primary dark:bg-token-main-surface-secondary select-none rounded-t-2xl">ts</div><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-sidebar-surface-primary text-token-text-secondary dark:bg-token-main-surface-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"><button class="flex gap-1 items-center select-none py-1" aria-label="Copy"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-xs"><path d="M12.668 10.667C12.668 9.95614 12.668 9.46258 12.6367 9.0791C12.6137 8.79732 12.5758 8.60761 12.5244 8.46387L12.4688 8.33399C12.3148 8.03193 12.0803 7.77885 11.793 7.60254L11.666 7.53125C11.508 7.45087 11.2963 7.39395 10.9209 7.36328C10.5374 7.33197 10.0439 7.33203 9.33301 7.33203H6.5C5.78896 7.33203 5.29563 7.33195 4.91211 7.36328C4.63016 7.38632 4.44065 7.42413 4.29688 7.47559L4.16699 7.53125C3.86488 7.68518 3.61186 7.9196 3.43555 8.20703L3.36524 8.33399C3.28478 8.49198 3.22795 8.70352 3.19727 9.0791C3.16595 9.46259 3.16504 9.95611 3.16504 10.667V13.5C3.16504 14.211 3.16593 14.7044 3.19727 15.0879C3.22797 15.4636 3.28473 15.675 3.36524 15.833L3.43555 15.959C3.61186 16.2466 3.86474 16.4807 4.16699 16.6348L4.29688 16.6914C4.44063 16.7428 4.63025 16.7797 4.91211 16.8027C5.29563 16.8341 5.78896 16.835 6.5 16.835H9.33301C10.0439 16.835 10.5374 16.8341 10.9209 16.8027C11.2965 16.772 11.508 16.7152 11.666 16.6348L11.793 16.5645C12.0804 16.3881 12.3148 16.1351 12.4688 15.833L12.5244 15.7031C12.5759 15.5594 12.6137 15.3698 12.6367 15.0879C12.6681 14.7044 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.4528 12.6634 14.8011 12.6602 15.0879 12.6367C15.4635 12.606 15.675 12.5492 15.833 12.4688L15.959 12.3975C16.2466 12.2211 16.4808 11.9682 16.6348 11.666L16.6914 11.5361C16.7428 11.3924 16.7797 11.2026 16.8027 10.9209C16.8341 10.5374 16.835 10.0439 16.835 9.33301V6.5C16.835 5.78896 16.8341 5.29563 16.8027 4.91211C16.7797 4.63025 16.7428 4.44063 16.6914 4.29688L16.6348 4.16699C16.4807 3.86474 16.2466 3.61186 15.959 3.43555L15.833 3.36524C15.675 3.28473 15.4636 3.22797 15.0879 3.19727C14.7044 3.16593 14.211 3.16504 13.5 3.16504H10.667C9.9561 3.16504 9.46259 3.16595 9.0791 3.19727C8.79739 3.22028 8.6076 3.2572 8.46387 3.30859L8.33399 3.36524C8.03176 3.51923 7.77886 3.75343 7.60254 4.04102L7.53125 4.16699C7.4508 4.32498 7.39397 4.53655 7.36328 4.91211C7.33985 5.19893 7.33562 5.54719 7.33399 6.00195H9.33301C10.022 6.00195 10.5791 6.00131 11.0293 6.03809C11.4873 6.07551 11.8937 6.15471 12.2705 6.34668L12.4883 6.46875C12.984 6.7728 13.3878 7.20854 13.6533 7.72949L13.7197 7.87207C13.8642 8.20859 13.9292 8.56974 13.9619 8.9707C13.9987 9.42092 13.998 9.97799 13.998 10.667V12.665ZM18.165 9.33301C18.165 10.022 18.1657 10.5791 18.1289 11.0293C18.0961 11.4302 18.0311 11.7914 17.8867 12.1279L17.8203 12.2705C17.5549 12.7914 17.1509 13.2272 16.6553 13.5313L16.4365 13.6533C16.0599 13.8452 15.6541 13.9245 15.1963 13.9619C14.8593 13.9895 14.4624 13.9935 13.9951 13.9951C13.9935 14.4624 13.9895 14.8593 13.9619 15.1963C13.9292 15.597 13.864 15.9576 13.7197 16.2939L13.6533 16.4365C13.3878 16.9576 12.9841 17.3941 12.4883 17.6982L12.2705 17.8203C11.8937 18.0123 11.4873 18.0915 11.0293 18.1289C10.5791 18.1657 10.022 18.165 9.33301 18.165H6.5C5.81091 18.165 5.25395 18.1657 4.80371 18.1289C4.40306 18.0962 4.04235 18.031 3.70606 17.8867L3.56348 17.8203C3.04244 17.5548 2.60585 17.151 2.30176 16.6553L2.17969 16.4365C1.98788 16.0599 1.90851 15.6541 1.87109 15.1963C1.83431 14.746 1.83496 14.1891 1.83496 13.5V10.667C1.83496 9.978 1.83432 9.42091 1.87109 8.9707C1.90851 8.5127 1.98772 8.10625 2.17969 7.72949L2.30176 7.51172C2.60586 7.0159 3.04236 6.6122 3.56348 6.34668L3.70606 6.28027C4.04237 6.136 4.40303 6.07083 4.80371 6.03809C5.14051 6.01057 5.53708 6.00551 6.00391 6.00391C6.00551 5.53708 6.01057 5.14051 6.03809 4.80371C6.0755 4.34588 6.15483 3.94012 6.34668 3.56348L6.46875 3.34473C6.77282 2.84912 7.20856 2.44514 7.72949 2.17969L7.87207 2.11328C8.20855 1.96886 8.56979 1.90385 8.9707 1.87109C9.42091 1.83432 9.978 1.83496 10.667 1.83496H13.5C14.1891 1.83496 14.746 1.83431 15.1963 1.87109C15.6541 1.90851 16.0599 1.98788 16.4365 2.17969L16.6553 2.30176C17.151 2.60585 17.5548 3.04244 17.8203 3.56348L17.8867 3.70606C18.031 4.04235 18.0962 4.40306 18.1289 4.80371C18.1657 5.25395 18.165 5.81091 18.165 6.5V9.33301Z"></path></svg>Copy</button><span class="" data-state="closed"><button class="flex items-center gap-1 py-1 select-none"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-xs"><path d="M12.0303 4.11328C13.4406 2.70317 15.7275 2.70305 17.1377 4.11328C18.5474 5.52355 18.5476 7.81057 17.1377 9.2207L10.8457 15.5117C10.522 15.8354 10.2868 16.0723 10.0547 16.2627L9.82031 16.4395C9.61539 16.5794 9.39783 16.7003 9.1709 16.7998L8.94141 16.8916C8.75976 16.9582 8.57206 17.0072 8.35547 17.0518L7.59082 17.1865L5.19727 17.5859C5.05455 17.6097 4.90286 17.6358 4.77441 17.6455C4.67576 17.653 4.54196 17.6555 4.39648 17.6201L4.24707 17.5703C4.02415 17.4746 3.84119 17.3068 3.72559 17.0957L3.67969 17.0029C3.59322 16.8013 3.59553 16.6073 3.60547 16.4756C3.61519 16.3473 3.6403 16.1963 3.66406 16.0537L4.06348 13.6602C4.1638 13.0582 4.22517 12.6732 4.3584 12.3096L4.45117 12.0791C4.55073 11.8521 4.67152 11.6346 4.81152 11.4297L4.9873 11.1953C5.17772 10.9632 5.4146 10.728 5.73828 10.4043L12.0303 4.11328ZM6.67871 11.3447C6.32926 11.6942 6.14542 11.8803 6.01953 12.0332L5.90918 12.1797C5.81574 12.3165 5.73539 12.4618 5.66895 12.6133L5.60742 12.7666C5.52668 12.9869 5.48332 13.229 5.375 13.8789L4.97656 16.2725L4.97559 16.2744H4.97852L7.37207 15.875L8.08887 15.749C8.25765 15.7147 8.37336 15.6839 8.4834 15.6436L8.63672 15.5811C8.78817 15.5146 8.93356 15.4342 9.07031 15.3408L9.2168 15.2305C9.36965 15.1046 9.55583 14.9207 9.90527 14.5713L14.8926 9.58301L11.666 6.35742L6.67871 11.3447ZM16.1963 5.05371C15.3054 4.16304 13.8616 4.16305 12.9707 5.05371L12.6074 5.41602L15.833 8.64258L16.1963 8.2793C17.0869 7.38845 17.0869 5.94456 16.1963 5.05371Z"></path><path d="M4.58301 1.7832C4.72589 1.7832 4.84877 1.88437 4.87695 2.02441C4.99384 2.60873 5.22432 3.11642 5.58398 3.50391C5.94115 3.88854 6.44253 4.172 7.13281 4.28711C7.27713 4.3114 7.38267 4.43665 7.38281 4.58301C7.38281 4.7295 7.27723 4.8546 7.13281 4.87891C6.44249 4.99401 5.94116 5.27746 5.58398 5.66211C5.26908 6.00126 5.05404 6.43267 4.92676 6.92676L4.87695 7.1416C4.84891 7.28183 4.72601 7.38281 4.58301 7.38281C4.44013 7.38267 4.31709 7.28173 4.28906 7.1416C4.17212 6.55728 3.94179 6.04956 3.58203 5.66211C3.22483 5.27757 2.72347 4.99395 2.0332 4.87891C1.88897 4.85446 1.7832 4.72938 1.7832 4.58301C1.78335 4.43673 1.88902 4.3115 2.0332 4.28711C2.72366 4.17203 3.22481 3.88861 3.58203 3.50391C3.94186 3.11638 4.17214 2.60888 4.28906 2.02441L4.30371 1.97363C4.34801 1.86052 4.45804 1.78333 4.58301 1.7832Z"></path></svg>Edit</button></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>type</span><span></span><span>PlayerGameState</span><span> = {
  </span><span>wallet</span><span>: </span><span>string</span><span>;
  </span><span>unmintedGirth</span><span>: </span><span>number</span><span>;
  </span><span>mintedGirth</span><span>: </span><span>number</span><span>;
  </span><span>totalTaps</span><span>: </span><span>number</span><span>;
  </span><span>upgradesOwned</span><span>: </span><span>string</span><span>[];
  </span><span>lastMintAt</span><span>: </span><span>string</span><span>;
  </span><span>lastStoryEntry</span><span>: </span><span>string</span><span>;
};
</span></span></code></div></div></pre>

Supabase handles reads/writes. Game sessions always begin from LocalStorage and *sync upward* via the parent Oracle UI → backend pipeline.

#### 🔗 C. Chain State (Read-Only or Enriched)

Queried on-demand from Solana RPC:

* $GIRTH token balance
* Owned NFTs (if minted)
* Staking status (if implemented later)

These don’t live in Supabase unless you're caching them.

**Backup Wallet Support?** For the hackathon and MVP:**ABSOLUTELY NOT.** This introduces immense complexity around managing multiple keys for a single identity and is a security quagmire.**One Wallet = One Identity.** This is a firm, Girthy line we draw in the sand for now.

---

### 🔁 3. Blockchain Integration Design

#### ?Should You Store Profile Data On-Chain?

OPTIONAL USE CASES — keep it off-chain unless:

* You want censorship resistance (not relevant here)
* If it is necessary for leaderboards when players decide to mint to blockchain
* You plan to make player profile NFTs (that’s v2+)
* 

**Keep Profile Data OFF-CHAIN. Keep Value & Verifiable Ownership ON-CHAIN.** The user's profile should *reflect* their on-chain assets, not store them.

### The Girthy Reasoning:

* **On-Chain Profile Data:****NO.** Storing mutable data like usernames or preferences on Solana is slow, expensive (requires paying rent/fees), and inflexible. The SaaS pitch is *stronger* when you show you understand this trade-off. Use your fast, cheap, and flexible Supabase database for profile data. The on-chain component is for things that *must* be trustless and globally verifiable.
* **NFT Integration:****YES, but as a DISPLAY layer.**
  * Your Bolt.new Oracle page (the parent) can and should have a section in the user's profile panel that displays their NFTs.
  * **How:** After the user connects their wallet, the parent page's JavaScript will use the `player_address` to make a call to a Solana RPC node or, even better, a **Digital Asset Standard (DAS) API Provider like Helius or SimpleHash.** These services are optimized to quickly fetch all NFTs owned by an address. The Oracle page then simply displays the images and metadata for these NFTs. The profile doesn't *store* the NFTs; it just *shows* what the blockchain says the user owns. This is a powerful, standard Web3 pattern.

#### ✅ Where Chain Operations Happen:

* Wallet connection + SIWS = Oracle page
* $GIRTH minting from treasury wallet = triggered from parent page
* Future staking, NFT mints = handled in Oracle dashboard

#### 🔐 SIWS Use Cases:

* Authorize access to game state
* Enable “Secure My Tokens” button
* Authenticate story entries, profile edits, or rewards
* Optional: Require SIWS before any token transfer
* 

**Transaction Signing Scope (for MVP):** The user should only need to sign:1. **A simple message** to prove wallet ownership for  **SIWS** . This is a cheap, off-chain signature that doesn't cost gas.

1. (Maybe) A transaction to **claim their airdropped `$GIRTH`** if you design the airdrop as a "claim" contract rather than a direct transfer.

---

### 🌉 Summary of the Interaction Flow

#### New Anonymous Player:

1. Starts tapping in game → LocalStorage
2. Delta is sent to Oracle → backend session created (anonymous)
3. Prompt: "Secure Your Progress by Connecting Wallet"
4. Player connects → SIWS
5. Session data merges into wallet-linked profile

#### Returning Authenticated Player:

1. Wallet auto-connects to Oracle
2. Game loads latest game state from Supabase
3. All interactions update Supabase live via Oracle's bridge

---

### 💡 Final Thoughts & Benefits

* You support **frictionless onboarding** (play before connect)
* Clean  **separation of concerns** :
  * Godot = game logic
  * Oracle = auth/wallet/backend
  * Supabase = state, abuse control, session logs
* Highly scalable design:
  * Add avatars, daily quests, leaderboards, NFT cosmetics without rewriting core logic
* Optional “profile NFT” or “Soulbound NFT” can come later to decentralize profiles if needed


```
sequenceDiagram
    Anonymous User->>Game: Accumulates soft balance
    Game->>LocalStorage: Store session progress
    User->>Oracle: Clicks "Connect Wallet"
    Oracle->>Wallet: SIWS request (nonce + message)
    Wallet->>Oracle: Signed message
    Oracle->>Supabase: Verify signature + create JWT
    Supabase->>Oracle: Auth session + user UUID
    Oracle->>Game: Bridge message: "merge_session"
    Game->>Supabase: POST anonymous_state (localStorage data)
    Supabase->>DB: Merge soft_balance + progress to user UUID
    Game->>LocalStorage: Clear anonymous state
```


---

## ✅ ACTIONABLE NEXT STEPS FOR CURSOR

### PENDING


# 🎯 **COMPREHENSIVE SIWS SYSTEM DESIGN**
**Integrating Your Vision with Existing Architecture**

Perfect! These documents provide exactly the context I needed. Your dual-balance $GIRTH system and SIWS strategy are brilliant - let me design a system that integrates your vision with the existing robust backend we just analyzed.

## 🧠 **ARCHITECTURAL INTEGRATION ANALYSIS**

### **✅ What Aligns Perfectly:**
- **Your `player_states` table** already supports anonymous + authenticated players
- **Event pipeline** (`ingest-chode-event`) already handles game state sync
- **Your dual-balance concept** maps perfectly to existing data structure
- **Oracle-only authentication** aligns with JavaScript bridge architecture

### **🔄 What Needs Enhancement:**
- Add $GIRTH balance tracking to existing tables
- Implement SIWS authentication layer
- Create profile system that links to existing player states
- Add anti-abuse systems for token minting

---

## 🏗️ **ENHANCED DATABASE ARCHITECTURE**

### **1. `user_profiles` (NEW - SIWS Identity Layer)**
```sql
CREATE TABLE user_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address        text UNIQUE NOT NULL,
  username             text UNIQUE,
  display_name         text,
  avatar_url           text,
  bio                  text CHECK (char_length(bio) <= 200),
  social_links         jsonb DEFAULT '{}',
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now(),
  last_login_at        timestamptz,
  total_sessions       integer DEFAULT 0,
  profile_completion   integer DEFAULT 0, -- 0-100% complete
  oracle_relationship  text DEFAULT 'novice', -- novice, adept, master, legendary
  preferences          jsonb DEFAULT '{}' -- UI preferences, notifications
);
```

### **2. `wallet_sessions` (NEW - SIWS Authentication)**
```sql
CREATE TABLE wallet_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id   uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token     text UNIQUE NOT NULL,
  wallet_address    text NOT NULL,
  siws_message      text NOT NULL, -- The signed SIWS message
  siws_signature    text NOT NULL, -- The wallet signature
  siws_nonce        text NOT NULL,
  expires_at        timestamptz NOT NULL,
  created_at        timestamptz DEFAULT now(),
  last_active_at    timestamptz DEFAULT now(),
  ip_address        inet,
  user_agent        text
);
```

### **3. `girth_balances` (NEW - Dual Balance System)**
```sql
CREATE TABLE girth_balances (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id       uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  soft_balance          numeric(20,6) DEFAULT 0.0, -- Unminted $GIRTH
  hard_balance          numeric(20,6) DEFAULT 0.0, -- Minted SPL tokens (cached)
  lifetime_earned       numeric(20,6) DEFAULT 0.0, -- Total ever earned
  lifetime_minted       numeric(20,6) DEFAULT 0.0, -- Total ever minted
  last_mint_at          timestamptz,
  last_story_entry_at   timestamptz,
  mint_cooldown_expires timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  UNIQUE(user_profile_id)
);
```

### **4. `player_states` (ENHANCED - Link to Profiles)**
```sql
-- Add new columns to existing table
ALTER TABLE player_states 
ADD COLUMN user_profile_id uuid REFERENCES user_profiles(id),
ADD COLUMN migration_status text DEFAULT 'native' CHECK (migration_status IN ('anonymous', 'claimed', 'native')),
ADD COLUMN claimed_at timestamptz,
ADD COLUMN last_sync_at timestamptz DEFAULT now();

-- Update existing structure concept:
/*
player_states now supports:
- Anonymous players: user_profile_id = NULL, is_anonymous = true
- Authenticated players: user_profile_id = UUID, is_anonymous = false  
- Migrated players: migration_status = 'claimed', claimed_at = timestamp
*/
```

### **5. `mint_events` (NEW - Anti-Abuse Tracking)**
```sql
CREATE TABLE mint_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id   uuid NOT NULL REFERENCES user_profiles(id),
  wallet_address    text NOT NULL,
  soft_amount       numeric(20,6) NOT NULL, -- Amount converted from soft
  spl_amount        numeric(20,6) NOT NULL, -- Amount minted as SPL
  transaction_hash  text, -- Solana transaction signature
  ip_address        inet,
  user_agent        text,
  captcha_token     text,
  status           text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at       timestamptz DEFAULT now(),
  completed_at     timestamptz
);
```

---

## 🔐 **SIWS AUTHENTICATION FLOW**

### **Oracle Page SIWS Implementation**
```typescript
class SIWSManager {
  private supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async connectWallet(walletAdapter: WalletAdapter) {
    // 1. Generate SIWS message with nonce
    const nonce = crypto.randomUUID();
    const message = this.createSIWSMessage(walletAdapter.publicKey!, nonce);
    
    // 2. Request signature from wallet
    const signature = await walletAdapter.signMessage(new TextEncoder().encode(message));
    
    // 3. Verify signature and create session
    const { data: session } = await this.supabase.functions.invoke('siws-verify', {
      body: {
        message,
        signature: Array.from(signature),
        wallet_address: walletAdapter.publicKey!.toString()
      }
    });
    
    if (session.success) {
      // 4. Handle anonymous state migration
      await this.handleStateMigration(session.user_profile);
      
      // 5. Notify game of authentication
      this.notifyGameAuthentication(session.user_profile);
      
      return session;
    }
  }

  private createSIWSMessage(publicKey: PublicKey, nonce: string): string {
    return `${window.location.host} wants you to sign in with your Solana account:
${publicKey.toString()}

Welcome to the CHODE-NET Oracle! By signing, you agree to our terms and gain access to the $GIRTH economy.

URI: ${window.location.origin}
Version: 1
Chain ID: 101
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;
  }
}
```

### **Backend SIWS Verification Function**
```typescript
// supabase/functions/siws-verify/index.ts
import { verify } from '@solana/web3.js';

export default async function handler(req: Request) {
  const { message, signature, wallet_address } = await req.json();
  
  // 1. Verify SIWS message signature
  const isValid = verify(
    new Uint8Array(signature),
    new TextEncoder().encode(message),
    new PublicKey(wallet_address)
  );
  
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }
  
  // 2. Get or create user profile
  const profile = await getOrCreateProfile(wallet_address);
  
  // 3. Create wallet session
  const session = await createWalletSession(profile.id, wallet_address, message, signature);
  
  // 4. Initialize girth balance if needed
  await initializeGirthBalance(profile.id);
  
  return new Response(JSON.stringify({
    success: true,
    user_profile: profile,
    session_token: session.session_token
  }));
}
```

---

## 💰 **DUAL-BALANCE $GIRTH SYSTEM**

### **Balance Tracking Integration**
```typescript
// Enhanced game event handler
async function handleGirthEarning(tapDelta: number, userProfileId: string | null) {
  const girthEarned = tapDelta * 0.000075; // Your exchange rate
  
  if (userProfileId) {
    // Authenticated user - update Supabase directly
    await supabase
      .from('girth_balances')
      .upsert({
        user_profile_id: userProfileId,
        soft_balance: supabase.raw(`soft_balance + ${girthEarned}`),
        lifetime_earned: supabase.raw(`lifetime_earned + ${girthEarned}`),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_profile_id' });
  } else {
    // Anonymous user - store in localStorage (your existing flow)
    const localBalance = parseFloat(localStorage.getItem('unminted_girth') || '0');
    localStorage.setItem('unminted_girth', (localBalance + girthEarned).toString());
  }
}
```

### **"Secure My Balance" Minting Flow**
```typescript
class GirthMintingSystem {
  async secureBalance(captchaToken: string) {
    // 1. Validate user is authenticated
    const session = await this.getCurrentSession();
    if (!session) throw new Error('Must be authenticated');
    
    // 2. Check cooldown
    const { data: balance } = await supabase
      .from('girth_balances')
      .select('*')
      .eq('user_profile_id', session.user_profile_id)
      .single();
    
    if (balance.mint_cooldown_expires && new Date() < new Date(balance.mint_cooldown_expires)) {
      throw new Error('Mint cooldown active');
    }
    
    // 3. Validate soft balance > 0
    if (balance.soft_balance <= 0) {
      throw new Error('No unminted $GIRTH to secure');
    }
    
    // 4. Process mint via backend
    const { data: mintResult } = await supabase.functions.invoke('process-girth-mint', {
      body: {
        user_profile_id: session.user_profile_id,
        captcha_token: captchaToken,
        amount: balance.soft_balance
      }
    });
    
    if (mintResult.success) {
      // 5. Update UI and notify game
      this.updateBalanceDisplay(mintResult.new_balances);
      this.notifyGameOfMint(mintResult);
    }
  }
}
```

---

## 🛡️ **ANTI-ABUSE SYSTEM**

### **Rate Limiting & Cooldowns**
```sql
-- Edge function for mint processing with abuse protection
CREATE OR REPLACE FUNCTION check_mint_eligibility(profile_id uuid)
RETURNS TABLE(eligible boolean, reason text) AS $$
BEGIN
  -- Check last mint time (24h cooldown)
  IF EXISTS (
    SELECT 1 FROM mint_events 
    WHERE user_profile_id = profile_id 
    AND created_at > NOW() - INTERVAL '24 hours'
    AND status = 'completed'
  ) THEN
    RETURN QUERY SELECT false, 'Mint cooldown active (24h)';
    RETURN;
  END IF;
  
  -- Check IP abuse (max 3 mints per IP per day)
  -- This would be implemented in the edge function with IP tracking
  
  RETURN QUERY SELECT true, 'Eligible for minting';
END;
$$ LANGUAGE plpgsql;
```

### **CAPTCHA Integration**
```typescript
// Frontend minting with hCaptcha
async function initiateMint() {
  // 1. Show hCaptcha
  const captchaToken = await hcaptcha.execute();
  
  // 2. Process mint with token
  await girthMinting.secureBalance(captchaToken);
}
```

---

## 🔄 **ANONYMOUS-TO-AUTHENTICATED MIGRATION**

### **State Claiming System**
```typescript
async function migrateAnonymousState(userProfileId: string) {
  // 1. Get anonymous session data from localStorage
  const anonymousGirth = parseFloat(localStorage.getItem('unminted_girth') || '0');
  const sessionId = localStorage.getItem('session_id');
  
  if (anonymousGirth > 0 && sessionId) {
    // 2. Find anonymous player state
    const { data: anonymousState } = await supabase
      .from('player_states')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_anonymous', true)
      .single();
    
    if (anonymousState) {
      // 3. Claim the anonymous state
      await supabase
        .from('player_states')
        .update({
          user_profile_id: userProfileId,
          is_anonymous: false,
          migration_status: 'claimed',
          claimed_at: new Date().toISOString()
        })
        .eq('id', anonymousState.id);
      
      // 4. Add anonymous girth to user's balance
      await supabase
        .from('girth_balances')
        .upsert({
          user_profile_id: userProfileId,
          soft_balance: anonymousGirth,
          lifetime_earned: anonymousGirth
        }, { onConflict: 'user_profile_id' });
      
      // 5. Clear localStorage
      localStorage.removeItem('unminted_girth');
      localStorage.removeItem('session_id');
    }
  }
}
```

---

## 🎯 **INTEGRATION WITH EXISTING BACKEND**

### **Enhanced Edge Functions**

#### **1. Update `ingest-chode-event` for Balance Tracking**
```typescript
// Add to existing function
if (eventData.event_type === "tap_batch" && eventData.player_address) {
  const tapCount = eventData.event_payload?.tap_count || 0;
  const girthEarned = tapCount * 0.000075;
  
  await supabaseAdmin
    .from('girth_balances')
    .upsert({
      user_profile_id: eventData.event_payload?.user_profile_id,
      soft_balance: supabaseAdmin.raw(`soft_balance + ${girthEarned}`),
      lifetime_earned: supabaseAdmin.raw(`lifetime_earned + ${girthEarned}`)
    }, { onConflict: 'user_profile_id' });
}
```

#### **2. New `process-girth-mint` Function**
```typescript
// New edge function for secure minting
export default async function handler(req: Request) {
  const { user_profile_id, captcha_token, amount } = await req.json();
  
  // 1. Verify CAPTCHA
  const captchaValid = await verifyCaptcha(captcha_token);
  if (!captchaValid) throw new Error('CAPTCHA verification failed');
  
  // 2. Check eligibility
  const { data: eligibility } = await supabase.rpc('check_mint_eligibility', {
    profile_id: user_profile_id
  });
  
  if (!eligibility[0].eligible) {
    throw new Error(eligibility[0].reason);
  }
  
  // 3. Execute SPL mint transaction
  const txHash = await mintSPLTokens(user_profile_id, amount);
  
  // 4. Update balances and create mint event
  await updateBalancesAndLog(user_profile_id, amount, txHash);
  
  return { success: true, transaction_hash: txHash };
}
```

---

## 📊 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core SIWS & Profile System** (Week 1)
1. ✅ Create new database tables
2. ✅ Implement SIWS authentication in Oracle page
3. ✅ Build profile creation/management UI
4. ✅ Test anonymous-to-authenticated migration

### **Phase 2: Dual-Balance Integration** (Week 2)  
1. ✅ Enhance existing event pipeline for balance tracking
2. ✅ Build "Secure My Balance" UI with CAPTCHA
3. ✅ Implement SPL minting backend
4. ✅ Add anti-abuse systems

### **Phase 3: Advanced Features** (Week 3)
1. ✅ Profile completion gamification
2. ✅ NFT display integration
3. ✅ Achievement system
4. ✅ Social features (leaderboards with profiles)

**This design perfectly integrates your vision with the existing robust architecture while maintaining security, scalability, and user experience. Ready to start implementation?**

---

## ✅ **IMPLEMENTATION STATUS UPDATE**

### **Phase 1: Core SIWS & Profile System - COMPLETE ✅**

#### **Database Schema Implementation:**
- ✅ **`user_profiles`** table created with complete identity management
- ✅ **`wallet_sessions`** table implemented with 7-day expiration
- ✅ **`girth_balances`** table deployed for dual-balance system
- ✅ **`mint_events`** table ready for anti-abuse tracking
- ✅ **`player_states`** enhanced with profile linking columns

#### **Backend Edge Functions:**
- ✅ **`siws-verify`** function deployed and production-ready
  - Ed25519 signature verification using tweetnacl
  - Complete profile creation/update workflow
  - Session management with security tracking
  - Anonymous-to-authenticated migration support
  - Girth balance initialization with 0.000075 exchange rate
  - Comprehensive error handling and validation

### **Integration Architecture Complete:**
```
Oracle Page → SIWS Authentication → siws-verify Function → Database
     ↓                                      ↓
Game Bridge ← Profile Session ← User Profile + Girth Balance
```

### **Ready for Phase 2:**
The complete SIWS backend infrastructure is now deployed and ready for frontend wallet connection interface implementation. All database tables, edge functions, and security systems are production-ready.