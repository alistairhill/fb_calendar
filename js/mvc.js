window.onload = function() {
  layOutDay()
}

function layOutDay(events) {
  var view = new View(),
  calendar = new Calendar(),
  controller = new Controller(events, view, calendar)
}

function View() {
  this.calendarDiv = ".events"
  this.eventDiv = ".event"
  this.calEvent = "event"
  this.timetable = ".timetable"
  this.timeBig = "time-big"
  this.timeSml = "time-sml"
  this.timeAM = ":00 <span>AM</span>"
  this.timePM = ":00 <span>PM</span>"
  this.halfTime = "<span>:30</span>"
  this.sampleLocation = "<span>Sample Location</span>"
}
View.prototype = {
  getCalendarDiv: function() {
    return document.querySelector(this.calendarDiv)
  },
  createDiv: function() {
    return document.createElement('div')
  },
  removeEvents: function() {
    var events = document.querySelectorAll(this.eventDiv)
    for (var i = 0, x = events.length; i < x; i++) {
      events[i].remove()
    }
  },
  getTimetable: function() {
    return document.querySelector(this.timetable)
  }
}

function Controller(events, view, calendar) {
  this.events = events || [{start: 30, end: 150},{start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670}]
  this.view = view
  this.calendar = calendar
  this.initialize()
}
Controller.prototype = {
  initialize: function() {
    this.loadTimetable(9, 12)
    this.view.removeEvents()
    if (this.events.length < 100) {
      var sortedEvents = this.events.sort(this.sortEventsByStart)
      this.calendar.makeEvents(sortedEvents)
      this.loadEvents()
    } else {
      return false
    }
  },
  loadTimetable: function(start, hours) {
    var totalTime = hours + start,
    dayTime = start,
    amPm = this.view.timeAM
    while (start <= totalTime) {
      var timeDiv = this.view.getTimetable(),
      timeBigDiv = this.view.createDiv(),
      timeSml = this.view.createDiv()
      timeDiv.appendChild(timeBigDiv).className = this.view.timeBig
      if (dayTime === hours) amPm = this.view.timePM
      timeBigDiv.innerHTML += dayTime + amPm
      if (start < totalTime) {
        timeDiv.appendChild(timeSml).className = this.view.timeSml
        timeSml.innerHTML += dayTime + this.view.halfTime
      }
      if (dayTime === hours) dayTime -= hours
      dayTime++
      start++
    }
  },
  addEventsToDOM: function(newEvent) {
    var duration = newEvent.endTime - newEvent.startTime,
    calDiv = this.view.getCalendarDiv(),
    eventDiv = this.view.createDiv()
    calDiv.appendChild(eventDiv).className = this.view.calEvent
    eventDiv.style.top = newEvent.startTime + "px"
    eventDiv.style.height = duration + "px"
    eventDiv.style.left = newEvent.eventLeft + "%"
    eventDiv.style.width = newEvent.eventWidth + "%"
    eventDiv.innerHTML = newEvent.eventTitle + "<br>" + this.view.sampleLocation
  },
  loadEvents: function() {
    var events = this.calendar.events
    for (var i = 0, x = events.length; i<x; i++) {
      this.addEventsToDOM(events[i])
    }
  },
  sortEventsByStart: function(a, b) {
    return a.start - b.start
  }
}

function Calendar() {
  this.events = []
  this.rowSets = []
}
Calendar.prototype = {
  makeEvents: function(events) {
    var newEvent
    for (var i = 0, x = events.length; i<x; i++) {
      if (events[i].start > 0 && events[i].end < 720) {
        newEvent = new Event(events[i].start, events[i].end)
        this.events.push(newEvent)
      }
    }
    return this.putEventsInRowSets()
  },
  putEventsInRowSets: function() {
    var events = this.events,
    newRowSet,
    currentLongestEnd
    for (var i = 0, x = events.length; i<x; i++) {
      if (i === 0) {
        currentLongestEnd = events[i].endTime
        newRowSet = new RowSet()
      } else {
        if (events[i].startTime >= currentLongestEnd) {
          newRowSet.makeEventColumns()
          this.rowSets.push(newRowSet)
          newRowSet = new RowSet()
        }
        if (currentLongestEnd < events[i].endTime) {
          currentLongestEnd = events[i].endTime
        }
      }
      newRowSet.rowSetEvents.push(events[i])
    }
    newRowSet.makeEventColumns()
    this.rowSets.push(newRowSet)
  }
}

function Event(startTime, endTime) {
  this.eventTitle = "Sample Item"
  this.eventLocation = "Sample Location"
  this.startTime = startTime
  this.endTime = endTime
  this.eventWidth
  this.eventLeft
  this.eventCol
}

function RowSet() {
  this.rowSetEvents = []
  this.highestCol
}
RowSet.prototype = {
  calculateRowWidths: function() {
    return 100 / this.highestCol
  },
  makeEventColumns: function() {
    var events = this.rowSetEvents,
    aboveEventColNum,
    currentEventEnd,
    currentCol = 0
    for (var i = 0, x = events.length; i<x; i++) {
      if (events[i].eventCol === undefined) {
        events[i].eventCol = currentCol
        aboveEventColNum = currentCol
        currentEventEnd = events[i].endTime
        currentCol++
        this.highestCol = currentCol
      }
      for (var y = 0; y<x; y++) {
        if (events[y].eventCol === undefined) {
          if (events[y].startTime >= currentEventEnd) {
            events[y].eventCol = aboveEventColNum
            currentEventEnd = events[y].endTime
          }
        }
      }
    }
    return this.updateRowSetEvents()
  },
  updateRowSetEvents: function() {
    var events = this.rowSetEvents
    for (var i = 0, x = events.length, left; i<x; i++) {
      events[i].eventWidth = this.calculateRowWidths()
      events[i].eventLeft = events[i].eventCol * events[i].eventWidth
    }
  }
}