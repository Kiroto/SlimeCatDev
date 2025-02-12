// Don't clutter environment
(() => {
    class PageCacheSource {
        constructor() { }

        getValue(key) {
            console.log(`Base PageCacheSource.getKey method called. Cannot get key ${key}`)
        }

        setValue(key, value) {
            console.log(`Base PageCacheSource.setKey method called. Cannot set key ${key}`)
        }
    }

    class InMemoryCacheSource extends PageCacheSource {
        constructor() {
            super()
            this.memory = {}
        }

        getValue(key) {
            return this.memory[key]
        }

        setValue(key, value) {
            this.memory[key] = value
        }
    }

    class LocalhostCacheSource extends PageCacheSource {
        CACHE_TIMESTAMP_TAG = "_TIMESTAMP"
        CACHE_TAG = "CACHED_"

        constructor(
            cacheExpirationTime = 60 * 60 * 1000 /*1 hour*/
        ) {
            super()
            this.cacheExpirationTime = cacheExpirationTime
        }

        getKey(key) { return this.CACHE_TAG + key + this.CACHE_TIMESTAMP_TAG }
        getTimestampKey(key) { return this.getKey(key) + this.CACHE_TIMESTAMP_TAG }

        getValue(key) {
            const cacheTimestamp = localStorage.getItem(this.getTimestampKey(key))
            if (!cacheTimestamp || (Date.now() - cacheTimestamp > this.cacheExpirationTime)) { // Expired or non-existant
                return undefined;
            }
            const cachedData = localStorage.getItem(key);
            return cachedData
        }

        setValue(key, value) {
            localStorage.setItem(getTimestampKey(key), Date.now())
            localStorage.setItem(key, value)
        }
    }


    const getSkill = (name) => {
        return skillData.skills.find(it => it.name == name);
    }

    const getSkillImage = (name) => {
        const skill = getSkill(name)
        if (skill === undefined) return "img/skills/unknownSkill.png"
        return skillData.meta.imgSource + skill.img
    }

    const addTimelineData = () => {
        const timelineList = document.getElementById('timeline-list')
        const timelineListItemTemplate = document.getElementById(
            'timeline-list-item-template'
        )
        const timelineSkillTemplate = document.getElementById("timeline-skill-template")

        const timelineDataList = timelineData.entries
        const timelineImgSource = timelineData.meta.imgSource
        const timelineContentFolder = "timeline"
        timelineDataList.forEach((timelineDatum, idx) => {
            const timelineListItem =
                timelineListItemTemplate.content.cloneNode(true)

            if (timelineDatum.img) {
                const timelineListItemImage =
                    timelineListItem.querySelector('.timeline-img')
                timelineListItemImage.src = timelineImgSource + timelineDatum.img
            }

            const timelineListItemTitle = timelineListItem.querySelector(
                '.timeline-list-item-title'
            )
            timelineListItemTitle.textContent = timelineDatum.name

            const timelineListItemDescription = timelineListItem.querySelector(
                '.timeline-list-item-description'
            )
            timelineListItemDescription.textContent = timelineDatum.description

            const timelineListItemDates = timelineListItem.querySelector(
                '.timeline-list-item-dates'
            )
            timelineListItemDates.textContent = `${timelineDatum.start} - ${timelineDatum.end}`
            if (timelineDatum.page) {
                const timelineContent = timelineListItem.querySelector(".timeline-list-item-body");
                loadSubpageCached(`${timelineContentFolder}/${timelineDatum.page}`).then(page => {
                    timelineContent.innerHTML = page;
                    timelineContent.removeAttribute("hidden")
                })
            }
            if (timelineDatum.skills && timelineDatum.skills.length > 0) {
                const timelineSkills = timelineListItem.querySelector(".timeline-list-item-skill-list");
                timelineDatum.skills.forEach(skillName => {
                    const timelineSkillItem = timelineSkillTemplate.content.cloneNode(true)
                    const timelineSkillImg = timelineSkillItem.querySelector(".skill-img")
                    timelineSkillImg.src = getSkillImage(skillName)
                    timelineSkillImg.alt = skillName
                    timelineSkillImg.title = skillName


                    timelineSkills.appendChild(timelineSkillItem)
                })
                timelineSkills.removeAttribute("hidden")
            }
            timelineList.appendChild(timelineListItem)
            if (idx != timelineDataList.length - 1) {
                timelineList.appendChild(document.createElement("hr"))
            }
        })
    }

    const addSkillData = () => {
        const skillGrid = document.getElementById('skill-grid')
        const skillGridItemTemplate = document.getElementById(
            'skill-grid-item-template'
        )

        const skillDataList = skillData.skills
        const skillImageSource = skillData.meta.imgSource

        const demoAvailableClass = 'demo-available'
        const linkAvailableClass = 'link-available'

        const demosSubfolder = "demos"
        skillDataList.forEach(skillDatum => {
            const skillGridItem = skillGridItemTemplate.content.cloneNode(true)

            if (skillDatum.img) {
                const skillGridItemImage = skillGridItem.querySelector('.skill-img')
                skillGridItemImage.src = skillImageSource + skillDatum.img
            }

            if (skillDatum.demo) {
                const skillContainer = skillGridItem.querySelector('.skill-grid-item')
                const demoIconContainer = skillGridItem.querySelector(".demo-icon")
                if (demoIconContainer) {
                    demoIconContainer.removeAttribute("hidden")
                }
                skillContainer.classList.add(demoAvailableClass)
                skillContainer.addEventListener("click", evt => {
                    loadSubpageModal(`${demosSubfolder}/${skillDatum.demo}`, skillDatum.name + " demo", memoryCache)
                })
            }

            const skillGridItemName = skillGridItem.querySelector('.skill-name')

            skillGridItemName.textContent = skillDatum.name

            if (skillDatum.link) {
                const skillContainer = skillGridItem.querySelector('.skill-grid-item')
                const linkIconContainer = skillGridItem.querySelector(".link-icon")
                if (linkIconContainer) {
                    linkIconContainer.removeAttribute("hidden")
                }
                skillContainer.classList.add(linkAvailableClass)
                skillContainer.addEventListener("click", evt => {
                    window.open(skillDatum.link, '_blank');
                })
            }

            if (skillDatum.description) {
                const skillListItemDescription = skillGridItem.querySelector(
                    '.skill-description'
                )

                skillListItemDescription.textContent = skillDatum.description
                skillListItemDescription.removeAttribute("hidden")
            }
            skillGrid.appendChild(skillGridItem)
        })
    }

    const memoryCache = new InMemoryCacheSource();

    /**
    * Loads a subpage from the site and shows it in the modal window.
    * @param {string} subpageLink 
    * @param {PageCacheSource} cacheSource 
    */
    const loadSubpageCached = async (subpageLink, cacheSource) => {
        if (cacheSource == undefined) cacheSource = memoryCache;
        const cachedSite = cacheSource.getValue(subpageLink);
        if (cachedSite) return cachedSite;

        const response = await fetch(`/src/${subpageLink}`);
        if (!response.ok) return `<p>Could not load subpage ${subpageLink}. Status ${response.status} - ${response.statusText}</p>`;

        const page = response.text();
        cacheSource.setValue(subpageLink, page);
        return page;
    }

    const modalElement = new bootstrap.Modal(document.getElementById("demos-modal"));


    const loadSubpageModal = async (subpageLink, modalTitle, cacheSource) => {
        const subpage = await loadSubpageCached(subpageLink, cacheSource)
        const modalElementContent = document.getElementById("demos-modal-content")
        const modalElementTitle = document.getElementById("demos-modal-title")
        modalElementTitle.innerText = modalTitle
        modalElementContent.innerHTML = subpage
        modalElement.show();
    }

    const skillGridToggleButton = document.getElementById("skill-grid-toggle-button")
    const skillGridContainer = document.getElementById("skill-grid-container")

    skillGridToggleButton.addEventListener("click", evt => {
        if (skillGridContainer.classList.contains("open")) {
            skillGridToggleButton.classList.remove("open")
            skillGridContainer.classList.remove("open")
            skillGridToggleButton.innerText = "Show Skills"
        } else {
            skillGridToggleButton.classList.add("open")
            skillGridContainer.classList.add("open")
            skillGridToggleButton.innerText = "Hide Skills"

        }
    })

    addTimelineData()
    addSkillData()
})();
