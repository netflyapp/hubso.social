# 🚀 Jak pracować z projektem z różnych komputerów

## ✅ Twoje repozytorium jest już skonfigurowane!
- **GitHub:** https://github.com/netflyapp/hubso.social.git
- **Gałąź:** master
- **Status:** Zsynchronizowany

---

## 📋 Podstawowy workflow (codzienne użycie)

### 1️⃣ Zanim zaczniesz pracę (na KAŻDYM komputerze)
```bash
git pull
```
**To pobierze najnowsze zmiany z GitHuba**

### 2️⃣ Pracuj normalnie
Edytuj pliki, twórz nowe - rób co potrzebujesz

### 3️⃣ Zapisz zmiany lokalnie
```bash
git add .
git commit -m "Opisz co zmieniłeś, np: dodałem nową stronę kontaktu"
```

### 4️⃣ Wyślij zmiany na GitHub
```bash
git push
```

---

## 🔄 Na drugim komputerze

### Pierwszy raz na nowym komputerze:
```bash
cd ~/Documents/02_projekty/
git clone https://github.com/netflyapp/hubso.social.git
cd hubso.social
```

### Każdy następny raz:
```bash
git pull    # Pobierz zmiany
# ... pracuj ...
git add .
git commit -m "Opis zmian"
git push    # Wyślij zmiany
```

---

## 📌 Najważniejsze zasady

1. **ZAWSZE** zacznij od `git pull` przed rozpoczęciem pracy
2. **ZAWSZE** zakończ pracę przez `git push` żeby zmiany trafiły na GitHub
3. Commit często - lepiej mieć więcej małych commitów niż jeden ogromny
4. Opisuj commity po polsku lub angielsku - jak wolisz

---

## 🆘 Przydatne komendy

```bash
# Zobacz co się zmieniło
git status

# Zobacz historię zmian
git log --oneline

# Zobacz różnice w plikach
git diff

# Cofnij zmiany w pliku (ostrożnie!)
git checkout -- nazwa_pliku.html

# Zobacz listę commitów
git log --graph --oneline --all

# Sprawdź z którym repozytorium jesteś połączony
git remote -v
```

---

## ⚠️ Jeśli wystąpi konflikt

Jeśli zobaczysz błąd przy `git pull` mówiący o konfliktach:

1. Git oznaczy pliki z konfliktem
2. Otwórz je i znajdź miejsca z `<<<<<<<`, `=======`, `>>>>>>>`
3. Wybierz którą wersję chcesz zachować
4. Usuń znaczniki konfliktu
5. Zapisz plik
6. Wykonaj:
```bash
git add nazwa_pliku.html
git commit -m "Rozwiązano konflikt"
git push
```

---

## 💡 Wskazówki

- **VS Code** pokazuje zmiany Git w pasku bocznym (ikona rozgałęzienia)
- Możesz używać GUI jak GitHub Desktop zamiast terminala
- Commituj logiczne zmiany, nie losowe pliki
- Jeśli coś pójdzie nie tak - nie panikuj! Git zapamiętuje historię

---

**Data konfiguracji:** 20 lutego 2026
**Skonfigurowane przez:** GitHub Copilot
