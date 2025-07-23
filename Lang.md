# Códigos de Idiomas do Google Tradutor

## Como usar no código

Para alterar o idioma de tradução, substitua o valor `'pt'` na linha do código:

```javascript
const translatedChapterTitle = await translateText(chapterTitle, 'pt');
```

E também na linha:

```javascript
const translatedChunk = await translateText(contentChunks[i], 'pt');
```

Substitua `'pt'` pelo código do idioma desejado da lista abaixo.

---

## Lista Completa de Idiomas Suportados

| Idioma | Código | Idioma | Código |
|--------|--------|--------|--------|
| **Africâner** | `af` | **Hindi** | `hi` |
| **Albanês** | `sq` | **Hmong** | `hmn` |
| **Alemão** | `de` | **Holandês** | `nl` |
| **Amárico** | `am` | **Húngaro** | `hu` |
| **Árabe** | `ar` | **Ibo** | `ig` |
| **Armênio** | `hy` | **Iídiche** | `yi` |
| **Azerbaijano** | `az` | **Indonésio** | `id` |
| **Basco** | `eu` | **Inglês** | `en` |
| **Bengali** | `bn` | **Irlandês** | `ga` |
| **Bielorrusso** | `be` | **Islandês** | `is` |
| **Birmanês** | `my` | **Italiano** | `it` |
| **Bósnio** | `bs` | **Japonês** | `ja` |
| **Búlgaro** | `bg` | **Javanês** | `jw` |
| **Catalão** | `ca` | **Cazaque** | `kk` |
| **Cebuano** | `ceb` | **Khmer** | `km` |
| **Checo** | `cs` | **Kinyarwanda** | `rw` |
| **Chinês (Simplificado)** | `zh-cn` | **Quirguiz** | `ky` |
| **Chinês (Tradicional)** | `zh-tw` | **Coreano** | `ko` |
| **Cingalês** | `si` | **Curdo** | `ku` |
| **Coreano** | `ko` | **Lao** | `lo` |
| **Corso** | `co` | **Latim** | `la` |
| **Croata** | `hr` | **Letão** | `lv` |
| **Dinamarquês** | `da` | **Lituano** | `lt` |
| **Eslovaco** | `sk` | **Luxemburguês** | `lb` |
| **Esloveno** | `sl` | **Macedônio** | `mk` |
| **Espanhol** | `es` | **Malgaxe** | `mg` |
| **Esperanto** | `eo` | **Malaio** | `ms` |
| **Estoniano** | `et` | **Malaiala** | `ml` |
| **Filipino** | `tl` | **Maltês** | `mt` |
| **Finlandês** | `fi` | **Maori** | `mi` |
| **Francês** | `fr` | **Marata** | `mr` |
| **Frísio** | `fy` | **Mongol** | `mn` |
| **Gaélico Escocês** | `gd` | **Nepalês** | `ne` |
| **Galego** | `gl` | **Norueguês** | `no` |
| **Galês** | `cy` | **Oriá** | `or` |
| **Georgiano** | `ka` | **Pashto** | `ps` |
| **Grego** | `el` | **Persa** | `fa` |
| **Guzerate** | `gu` | **Polonês** | `pl` |
| **Haitiano** | `ht` | **Português** | `pt` |
| **Hauçá** | `ha` | **Punjabi** | `pa` |
| **Havaiano** | `haw` | **Romeno** | `ro` |
| **Hebraico** | `iw` | **Russo** | `ru` |
| **Samoano** | `sm` | **Turco** | `tr` |
| **Sérvio** | `sr` | **Turcomeno** | `tk` |
| **Sesoto** | `st` | **Ucraniano** | `uk` |
| **Shona** | `sn` | **Urdu** | `ur` |
| **Somali** | `so` | **Usbeque** | `uz` |
| **Suaíli** | `sw` | **Vietnamita** | `vi` |
| **Sueco** | `sv` | **Xhosa** | `xh` |
| **Sundanês** | `su` | **Zulu** | `zu` |
| **Tagalo** | `tl` | | |
| **Tajique** | `tg` | | |
| **Tâmil** | `ta` | | |
| **Tailandês** | `th` | | |
| **Telugu** | `te` | | |
| **Tcheco** | `cs` | | |

---

## Exemplos de Uso Comum

### Português (Brasil)
```javascript
const translatedText = await translateText(text, 'pt');
```

### Inglês
```javascript
const translatedText = await translateText(text, 'en');
```

### Espanhol
```javascript
const translatedText = await translateText(text, 'es');
```

### Francês
```javascript
const translatedText = await translateText(text, 'fr');
```

### Alemão
```javascript
const translatedText = await translateText(text, 'de');
```

### Italiano
```javascript
const translatedText = await translateText(text, 'it');
```

### Russo
```javascript
const translatedText = await translateText(text, 'ru');
```

### Japonês
```javascript
const translatedText = await translateText(text, 'ja');
```

### Chinês (Simplificado)
```javascript
const translatedText = await translateText(text, 'zh-cn');
```

### Coreano
```javascript
const translatedText = await translateText(text, 'ko');
```

---

## Notas Importantes

- **Detecção automática**: Use `'auto'` como idioma de origem para detectar automaticamente
- **Português**: O código `'pt'` detecta automaticamente entre PT-BR e PT-PT
- **Chinês**: Use `'zh-cn'` para simplificado e `'zh-tw'` para tradicional
- **Códigos insensíveis a maiúsculas**: `'pt'`, `'PT'` e `'Pt'` funcionam igual

### Exemplo com detecção automática:
```javascript
// Traduz de qualquer idioma para português
const translatedText = await translateText(originalText, 'pt');
```
