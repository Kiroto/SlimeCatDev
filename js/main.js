// Don't clutter environment
(() => {

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
        skillDataList.forEach(skillDatum => {
            const skillGridItem = skillGridItemTemplate.content.cloneNode(true)

            if (skillDatum.img) {
                const skillGridItemImage = skillGridItem.querySelector('img')
                skillGridItemImage.src = skillImageSource + skillDatum.img
            }

            if (skillDatum.demo) {
                const skillContainer =
                    skillGridItem.querySelector('.skill-grid-item')
                skillContainer.classList.add(demoAvailableClass)
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
                const toolContainer = toolListItem.querySelector('.tool-list-item')
                toolContainer.classList.add(linkAvailableClass)
            }

            toolListItemDescription.textContent = toolDatum.description

            toolList.appendChild(toolListItem)
        })
    }

    addTimelineData()
    addSkillData()
    addToolData()
})();
