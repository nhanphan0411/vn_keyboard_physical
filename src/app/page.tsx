"use client"
import { useState, useEffect, useRef } from "react";
import { fetchDictionary } from "./components/dictParser";

export default function SyllableMatrix() {
  type DictionaryEntry = {
    word: string;
    _word_: string;
    description: string;
  }
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);

  type ParsedDescription = {
    description: string[];
  };

  type SearchResult = {
    [word: string]: ParsedDescription[];
  };

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [displayDescriptions, setDisplayDescriptions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lang, setLang] = useState<"eng" | "viet">("eng");

  const searchResultsRef = useRef<HTMLDivElement>(null);

  const [pre, setPre] = useState("");
  const [vow, setVow] = useState("");
  const [post, setPost] = useState("");
  const [tone, setTone] = useState("ngang");
  const [syllable, setSyllable] = useState("");
  const [macroString, setMacroString] = useState("");

  // ============================== TONE =============================== //
  const toneMap: Record<string, Record<string, string>> = {
    "a": { "sac": "á", "huyen": "à", "hoi": "ả", "nga": "ã", "nang": "ạ", "ngang": "a" },
    "ă": { "sac": "ắ", "huyen": "ằ", "hoi": "ẳ", "nga": "ẵ", "nang": "ặ", "ngang": "ă" },
    "â": { "sac": "ấ", "huyen": "ầ", "hoi": "ẩ", "nga": "ẫ", "nang": "ậ", "ngang": "â" },
    "e": { "sac": "é", "huyen": "è", "hoi": "ẻ", "nga": "ẽ", "nang": "ẹ", "ngang": "e" },
    "ê": { "sac": "ế", "huyen": "ề", "hoi": "ể", "nga": "ễ", "nang": "ệ", "ngang": "ê" },
    "i": { "sac": "í", "huyen": "ì", "hoi": "ỉ", "nga": "ĩ", "nang": "ị", "ngang": "i" },
    "o": { "sac": "ó", "huyen": "ò", "hoi": "ỏ", "nga": "õ", "nang": "ọ", "ngang": "o" },
    "ô": { "sac": "ố", "huyen": "ồ", "hoi": "ổ", "nga": "ỗ", "nang": "ộ", "ngang": "ô" },
    "ơ": { "sac": "ớ", "huyen": "ờ", "hoi": "ở", "nga": "ỡ", "nang": "ợ", "ngang": "ơ" },
    "u": { "sac": "ú", "huyen": "ù", "hoi": "ủ", "nga": "ũ", "nang": "ụ", "ngang": "u" },
    "ư": { "sac": "ứ", "huyen": "ừ", "hoi": "ử", "nga": "ữ", "nang": "ự", "ngang": "ư" },
    "y": { "sac": "ý", "huyen": "ỳ", "hoi": "ỷ", "nga": "ỹ", "nang": "ỵ", "ngang": "y" },
  };

  const reverseToneMap = Object.entries(toneMap).reduce((acc, [base, tones]) => {
    Object.entries(tones).forEach(([tone, char]) => {
      acc[char] = { base, tone };
    });
    return acc;
  }, {} as Record<string, { base: string; tone: string }>);

  const applyTone = (vowel: string, tone: string): string => {
    // Normalize tone
    const chars = vowel.split("").map((ch) => reverseToneMap[ch]?.base || ch);
    const plainVowel = chars.join("");

    // Decide tonal position
    const len = chars.length;
    let targetIndex = 0;

    if (len === 1) {
      targetIndex = 0;
    } else if (len === 2) {
      if (
        plainVowel === "uâ" ||
        plainVowel === "uê" ||
        plainVowel === "uơ" ||
        plainVowel === "uy" ||
        plainVowel === "iê" ||
        plainVowel === "oa" ||
        plainVowel === "oă" ||
        plainVowel === "oâ" ||
        plainVowel === "oe" ||
        plainVowel === "ươ" ||
        plainVowel === "yê"
      ) {
        targetIndex = 1;
      } else {
        targetIndex = 0;
      }
    } else if (len === 3) {
      if (plainVowel === "uyê") {
        targetIndex = 2;
      } else {
        targetIndex = 1;
      }

    } else {
      return vowel; // fallback
    }

    // Apply tone
    const baseChar = chars[targetIndex];
    const tonedChar = toneMap[baseChar]?.[tone] || baseChar;
    const newChars = [...chars];
    newChars[targetIndex] = tonedChar;

    return newChars.join("");
  }

  // ============================== SEARCH =============================== //
  const search = (searchWord: string) => {
    const searchPattern = "_" + searchWord + "_";
    const result = dictionary.filter(entry => entry._word_.includes(searchPattern));
    if (result.length > 0) {
      setSearchResults(result.map(r => ({ [r._word_]: [{ description: eval(r.description) }] })));
    } else {
      setSearchResults([]);
    }

    if (syllable === "") {
      setSearchResults([]);
    }
  };

  // ========================== RANDOM SYLLABLE =========================== //
  // Placeholder data for the consonants and vowels
  const preConsonants = ["b", "c", "ch", "d", "đ", "g", "gh", "gi", "h", "k", "kh", "l", "m", "n", "ng", "ngh", "nh", "p", "ph", "qu", "r", "s", "t", "th", "tr", "v", "x"];
  const vowels = ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y', 'aa', 'aă', 'aâ', 'ae', 'aê', 'ai', 'ao', 'aô', 'aơ', 'au', 'aư', 'ay', 'ăa', 'ăă', 'ăâ', 'ăe', 'ăê', 'ăi', 'ăo', 'ăô', 'ăơ', 'ău', 'ăư', 'ăy', 'âa', 'âă', 'ââ', 'âe', 'âê', 'âi', 'âo', 'âô', 'âơ', 'âu', 'âư', 'ây', 'ea', 'eă', 'eâ', 'ee', 'eê', 'ei', 'eo', 'eô', 'eơ', 'eu', 'eư', 'ey', 'êa', 'êă', 'êâ', 'êe', 'êê', 'êi', 'êo', 'êô', 'êơ', 'êu', 'êư', 'êy', 'ia', 'iă', 'iâ', 'ie', 'iê', 'ii', 'io', 'iô', 'iơ', 'iu', 'iư', 'iy', 'oa', 'oă', 'oâ', 'oe', 'oê', 'oi', 'oo', 'oô', 'oơ', 'ou', 'oư', 'oy', 'ôa', 'ôă', 'ôâ', 'ôe', 'ôê', 'ôi', 'ôo', 'ôô', 'ôơ', 'ôu', 'ôư', 'ôy', 'ơa', 'ơă', 'ơâ', 'ơe', 'ơê', 'ơi', 'ơo', 'ơô', 'ơơ', 'ơu', 'ơư', 'ơy', 'ua', 'uă', 'uâ', 'ue', 'uê', 'ui', 'uo', 'uô', 'uơ', 'uu', 'uư', 'uy', 'ưa', 'ưă', 'ưâ', 'ưe', 'ưê', 'ưi', 'ưo', 'ưô', 'ươ', 'ưu', 'ưư', 'ưy', 'ya', 'yă', 'yâ', 'ye', 'yê', 'yi', 'yo', 'yô', 'yơ', 'yu', 'yư', 'yy', 'iêu', 'oao', 'oeo', 'oai', 'oay', 'uây', 'uôi', 'uya', 'uyu', 'uyê', 'ươi', 'ươu', 'yêu'];
  const postConsonants = ["c", "ch", "m", "n", "ng", "nh", "p", "t"];
  const tones = ["ngang", "sac", "huyen", "hoi", "nga", "nang"];
  function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  const generateRandomSyllable = () => {
    const randomPre = getRandom(preConsonants);
    const randomVow = getRandom(vowels);
    const randomPost = Math.random() < 0.5 ? getRandom(postConsonants) : "";
    const randomTone = getRandom(tones);

    setPre(randomPre);
    setVow(randomVow);
    setPost(randomPost);
    setTone(randomTone);
  };

  const generateRandomWordFromDictionary = () => {
    if (dictionary.length === 0) return;

    // Pick a random word from the dictionary
    const randomEntry = getRandom(dictionary);
    const word = getRandom(randomEntry._word_.replace(/_/g, " ").trim().split(" "))

    // Deconstruct the word into its parts
    let tempPre = "";
    let tempPost = "";
    let tempVowWithTone = word;
    let tempTone = "ngang";

    // Find the longest pre-consonant match
    const sortedPreConsonants = [...preConsonants].sort((a, b) => b.length - a.length);
    for (const pre of sortedPreConsonants) {
      if (word.startsWith(pre)) {
        tempPre = pre;
        tempVowWithTone = word.substring(pre.length);
        break;
      }
    }

    // Find the longest post-consonant match
    const sortedPostConsonants = [...postConsonants].sort((a, b) => b.length - a.length);
    for (const post of sortedPostConsonants) {
      if (tempVowWithTone.endsWith(post)) {
        tempPost = post;
        tempVowWithTone = tempVowWithTone.substring(0, tempVowWithTone.length - post.length);
        break;
      }
    }

    // Find the tone from the remaining vowel part
    const tonedChar = tempVowWithTone.split("").find(char => reverseToneMap[char]);
    if (tonedChar) {
      const { base, tone } = reverseToneMap[tonedChar];
      tempTone = tone;
      // Get the plain vowel by replacing the toned char with its base char
      const plainVowel = tempVowWithTone.replace(tonedChar, base);
      setVow(plainVowel);
    } else {
      setVow(tempVowWithTone);
      // setTone("ngang");
    }

    // Set the state
    setPre(tempPre);
    setPost(tempPost);
    setTone(tempTone);
  };

  const parseVietnameseString = (rawString: string) => {
    // Define your mapping of codes to Unicode characters.
    // This object is the heart of the conversion logic.
    const charMap: Record<
      'a0' | 'a6' | 'a8' | 'e0' | 'e6' | 'i0' | 'o0' | 'o6' | 'o7' | 'u0' | 'u7' | 'y0',
      string
    > = {
      'a0': 'a',
      'a6': 'â',
      'a8': 'ă',
      'e0': 'e',
      'e6': 'ê',
      'i0': 'i',
      'o0': 'o',
      'o6': 'ô',
      'o7': 'ơ',
      'u0': 'u',
      'u7': 'ư',
      'y0': 'y',
    };

    // Check if the input string is valid.
    if (!rawString || typeof rawString !== 'string' || rawString.trim() === '') {
      return '';
    }

    // Split the string by the underscore character to get the codes.
    // For example, "e0_e6" becomes ["e0", "e6"].
    const parts = rawString.split('_');

    // We filter out any empty strings that might result from splitting.
    const codes = parts.filter(Boolean);

    let finalWord = "";
    for (const code of codes) {
      if (charMap.hasOwnProperty(code)) {
        finalWord += charMap[code as keyof typeof charMap];
      } else {
        // If a code is not found, you can decide what to do.
        // Here, we just append the original code.
        finalWord += `[${code}]`;
      }
    }

    return finalWord;
  };

  // ============================== EFFECT =============================== //
  useEffect(() => {
    fetchDictionary()
      .then((data: DictionaryEntry[]) => {
        setDictionary(data);
      })
      .catch((err: Error) => console.error("Failed to fetch dictionary:", err));
  }, []);

  useEffect(() => {
    const combinedSyllable = pre + applyTone(vow, tone) + post;
    setSyllable(combinedSyllable);
  }, [pre, vow, post, tone]);


  useEffect(() => {
    search(syllable);
  }, [syllable]);

  // NEW useEffect to automatically display the first search result's description
  useEffect(() => {
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      const firstWord = Object.keys(firstResult)[0];
      const all_descriptions = firstResult[firstWord][0]['description'];

      const formattedDescriptions = (all_descriptions as unknown as { [key: string]: string[] }[]).map((d) => {
        const theWord = firstWord.replace(/_/g, " ").trim();
        const typeWord = Object.keys(d).join("; ");
        const detail = Object.values(d).flat().join("; ");
        return `"${theWord}" ﹣ ${typeWord}: ${detail}`;
      });
      setDisplayDescriptions(formattedDescriptions);
      setSelectedWord(firstWord); // Set the first word as selected by default
      setSelectedIndex(0); // Set the index of the first word as selected
    } else {
      // Clear the descriptions and selection if there are no search results
      setDisplayDescriptions([]);
      setSelectedWord(null);
      setSelectedIndex(null); // Clear the index as well
    }
  }, [searchResults]);

  useEffect(() => {
    const updateSelection = (index: number) => {
      if (index >= 0 && index < searchResults.length) {
        const result = searchResults[index];
        const word = Object.keys(result)[0];
        const all_descriptions = result[word][0]['description'];

        const formattedDescriptions = (all_descriptions as unknown as { [key: string]: string[] }[]).map((d) => {
          const theWord = word.replace(/_/g, " ").trim();
          const typeWord = Object.keys(d).join("; ");
          const detail = Object.values(d).flat().join("; ");
          return `"${theWord}" ﹣ ${typeWord}: ${detail}`;
        });
        setDisplayDescriptions(formattedDescriptions);
        setSelectedWord(word);
        setSelectedIndex(index);
        console.log(selectedWord)

        // Scroll the selected item into view
        const selectedElement = searchResultsRef.current?.children[index];
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      // Define our functional keys as an array for easy checking.
      const functionalKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "\\", "/", "@", "Delete"];

      // Prevent default browser behavior for all functional keys.
      if (functionalKeys.includes(key)) {
        event.preventDefault();
      }

      // Handle random syllable generation with the "\" key.
      if (key === "\\") {
        generateRandomSyllable();
        // Clear the macro string when a new action is performed.
        setMacroString("");
        return;
      }

      // Handle smart random word generation with the "/" key.
      if (key === "/") {
        generateRandomWordFromDictionary();
        // Clear the macro string when a new action is performed.
        setMacroString("");
        return;
      }

      if (key === "Delete") {
        if (post != "") {
          setPost("");
        } else {
          if (vow != "") {
            setVow("");
          } else {
            if (pre != "") {
              setPre("");
            }
          }
        }
      }

      // Handle up/down arrow for search results selection.
      if (key === "ArrowUp") {
        if (selectedIndex !== null && selectedIndex > 0) {
          updateSelection(selectedIndex - 1);
        }
        return;
      } else if (key === "ArrowDown") {
        if (selectedIndex !== null) {
          if (selectedIndex === searchResults.length - 1) {
            updateSelection(0);
          } else {
            updateSelection(selectedIndex + 1);
          }
        }
        return;
      }


      // This is the new macro logic:
      // When the '@' key is pressed, we process the macro string.
      if (key === "@") {
        if (macroString.startsWith("PRE_")) {
          const prePart = macroString.substring(4);
          if (prePart === "d9") {
            if (pre != "đ") {
              setPre("đ");
            }
          } else {
            if (prePart != pre) {
              setPre(prePart);
            }
          }
        } else if (macroString.startsWith("VOW_")) {
          const vow_ = parseVietnameseString(macroString.substring(4));
          if (vow_ != vow) {
            setVow(vow_);
            setTone("ngang");
          }
        } else if (macroString.startsWith("POS_")) {
          const posPart = macroString.substring(4);
          if (posPart != post) {
            setPost(posPart);
          }

        } else if (macroString.startsWith("TONE_")) {
          const tonePart = macroString.substring(5);
          if (tonePart != tone) {
            setTone(tonePart);
          }
        } else if (macroString.startsWith("OK")) {
          speak(syllable.replace(/_/g, " ").trim());
          setMacroString("");
        }
        // Reset the macro string after processing.
        setMacroString("");
        return;
      }

      // For all other single-character keys, add them to the macro string.
      // This is the default behavior for all non-functional keys.
      if (key.length === 1) {
        setMacroString(prev => prev + key);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, searchResults, macroString]);

  // ============================== UI COMPONENTS =============================== //
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    window.speechSynthesis.speak(utterance);
  };

  return (

    <div className="flex h-screen text-sm p-1 gap-x-2 bg-black text-white">
      {/* Left panel */}
      <div id="left" className="w-1/2 p-2 rounded flex flex-col gap-1">
        <div className="flex">
          <button
            onClick={() => setLang(lang === "eng" ? "viet" : "eng")}
            className="px-6 py-3 rounded border border-gray-400 text-md font-bold bg-gray-800 hover:bg-gray-700 transition-colors tracking-wide"
          >
            {lang === "eng" ? "CHUYỂN SANG TIẾNG VIỆT" : "TO ENGLISH INTERFACE"}
          </button>
        </div>
        
        <h1 className="mt-4"><i>{lang === "eng" ? "MAKE A VIET SYLLABLE" : "BÀN PHÍM TIẾNG VIỆT"}</i></h1>



        <div id="guide" className="py-1">
          <img src={lang === "eng" ? "guide_eng.svg" : "guide_vn.svg"} width="100%"></img>
        </div>

        <div id="project_description" className="rounded border-gray-300 py-2">
          {lang === "eng" ? (
            <>
              <br></br>
              <p>Despite its alphabetic appearance, the structure of Vietnamese is deeply rooted in the structure of <br /><b>PRE_CONSONANT + VOWELS + POST_CONSONANT</b>             
              . This keyboard is an attempt to use our language in a more intuitive way, a way that appreciates the abundance of our syllables, which holds the sound, the feeling,
                and the story of the Vietnamese. You can read the entire project at <b>codesurfing.club/OurVietnameseProject.</b>
              </p>
            </>
          ) : (
            <>
            <br></br>
              <p>Căn tính tiếng Việt không nằm ở từng chữ cái alphabet, mà nằm ở từng âm tiết. Từ ngày bắt đầu tới lớp, ta viết tiếng Việt bằng công thức <br /><b>PHỤ ÂM ĐẦU + NGUYÊN ÂM + PHỤ ÂM CUỐI</b>
              . Bàn phím này đề xuất một cách gõ tiếng Việt gần với tiếng Việt hơn — trân trọng sự phong phú của âm tiết Việt với âm sắc, cảm xúc
                và câu chuyện của người Việt. Bạn có thể đọc toàn bộ dự án tại <b>codesurfing.club/OurVietnameseProject.</b>
              </p>
            </>
          )}
        </div>


      </div>

      {/* Right panel */}
      <div id="right" className="w-1/2 p-2 m-1 flex flex-col gap-3 text-black">
        <div id="inputBox" className="h-1/5 bg-white border-1 rounded border-gray-300 p-2 flex flex-col gap-2">
          {/* <input
            type="text"
            value={syllable}
            onChange={(e) => setSyllable(e.target.value)}
            placeholder="Type syllable..."
            className="border border-gray-400 rounded px-2 py-1 w-full"
          /> */}
          <div id="formedSyllable" className=" text-center flex flex-row p-2">
            <h1>{syllable}</h1>
            <button
              className="ml-2 px-2 py-1 rounded action-btn"
              onClick={() => speak(syllable.replace(/_/g, " ").trim())}
            >
              🔊
            </button>
          </div>
        </div>

        <div id="searchResults" ref={searchResultsRef} className="h-2/5 bg-white rounded p-2 flex flex-col gap-1 overflow-y-auto border border-gray-300">
          {searchResults.map((result, resultIndex) => (
            Object.keys(result).map((word, wordIndex) => (
              <div key={`${resultIndex}-${wordIndex}`}>
                <p
                  onClick={() => {
                    const all_descriptions = result[word][0]['description'];

                    // Go through and render all descriptions
                    const a = (all_descriptions as unknown as { [key: string]: string[] }[]).map((d) => {
                      const theWord = word.replace(/_/g, " ").trim();
                      const typeWord = Object.keys(d).join("; ");
                      const detail = Object.values(d).flat().join("; ");
                      return `"${theWord}" ﹣ ${typeWord}: ${detail}`;
                    });
                    setDisplayDescriptions(a);
                    setSelectedWord(word); // <-- Set the clicked word as selected
                    setSelectedIndex(resultIndex);
                  }}
                  className={
                    `cursor-pointer hover:underline p-1 rounded transition-colors text-xl ${selectedIndex === resultIndex ? 'bg-blue-300' : ''
                    }`
                  }>
                  {word.replace(/_/g, " ").trim()}
                </p>
              </div>
            ))
          ))}
        </div>

        <div id="meaning" className="h-2/5 bg-gray-100 rounded p-2 flex flex-col gap-1 overflow-y-auto border border-gray-300">
          {displayDescriptions.map((description, index) => (
            <p key={index} className="text-xl mb-2">{description}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
