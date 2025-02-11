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


    const addTimelineData = () => {
        const timelineList = document.getElementById('timeline-list')
        const timelineListItemTemplate = document.getElementById(
            'timeline-list-item-template'
        )

        const timelineDataList = timelineData.entries
        const timelineImgSource = timelineData.meta.imgSource

        timelineDataList.forEach(timelineDatum => {
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

            timelineList.appendChild(timelineListItem)
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
                    loadSubpageModal(`${demosSubfolder}/${skillDatum.demo}`, skillDatum.name + " demo", cacheSource)
                })
            }

            const skillGridItemName = skillGridItem.querySelector('.skill-name')

            skillGridItemName.textContent = skillDatum.name

            skillGrid.appendChild(skillGridItem)
        })
    }

    const addToolData = () => {
        const toolList = document.getElementById('tool-list')
        const toolListItemTemplate = document.getElementById(
            'tool-list-item-template'
        )

        const toolDataList = toolData.entries
        const toolImageSource = toolData.meta.imgSource

        const linkAvailableClass = 'link-available'

        toolDataList.forEach(toolDatum => {
            const toolListItem = toolListItemTemplate.content.cloneNode(true)

            if (toolDatum.img) {
                const toolListItemImage = toolListItem.querySelector('.tool-img')
                toolListItemImage.src = toolImageSource + toolDatum.img
            }

            const toolListItemTitle = toolListItem.querySelector(
                '.tool-list-item-title'
            )
            toolListItemTitle.textContent = toolDatum.name

            const toolListItemDescription = toolListItem.querySelector(
                '.tool-list-item-description'
            )

            if (toolDatum.link) {
                const linkIconContainer = toolListItem.querySelector(".link-icon")
                if (linkIconContainer) {
                    linkIconContainer.removeAttribute("hidden")
                }
                const toolContainer = toolListItem.querySelector('.tool-list-item')
                toolContainer.classList.add(linkAvailableClass)
                toolContainer.addEventListener("click", evt => {
                    window.open(toolDatum.link, '_blank');
                })
            }

            toolListItemDescription.textContent = toolDatum.description

            toolList.appendChild(toolListItem)
        })
    }

    const cacheSource = new InMemoryCacheSource();

    /**
    * Loads a subpage from the site and shows it in the modal window.
    * @param {string} subpageLink 
    * @param {PageCacheSource} cacheSource 
    */
    const loadSubpageCached = async (subpageLink, cacheSource) => {
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


    addTimelineData()
    addSkillData()
    addToolData()
})();
