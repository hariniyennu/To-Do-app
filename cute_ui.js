document.addEventListener("DOMContentLoaded", function(){
    loadingdate();
    loadtasks();
    enter();
    handleFinishBtn();
});

function loadingdate(){
    const today=new Date();
    const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["January","February","March","April","May","June",
        "July","August","September","October","November","December"];
    document.getElementById('day').textContent=weekdays[today.getDay()];
    document.getElementById('circle').textContent=today.getDate();
    document.getElementById('month').textContent=months[today.getMonth()];
}

function enter(){
    document.getElementById('myinp').addEventListener('keypress',function(e){
        if(e.key==='Enter'){
            newElement();
        }
    });
}
function newElement(){
    let task=document.getElementById('myinp');
    let taskval=task.value.trim();
    if (taskval==="") {
        alert("Enter a task!");
    } else {
        const taskObj={value:taskval,completed:false };
        addtodom(taskObj);
        savetols(taskObj); 
        playAddSound();
    }
    task.value = "";
}

function addtodom(taskobj){
    let li=document.createElement('li');
    li.className="task-item";
    if(taskobj.completed) {
        li.classList.add("checked");
    }
    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = taskobj.value;
    li.appendChild(textSpan);

    const closeBtn=document.createElement("span");
    closeBtn.className="close";
    closeBtn.innerHTML="x";
    li.appendChild(closeBtn);

    closeBtn.addEventListener('click',function(e) {
        e.stopPropagation();
        removetasks(taskobj.value);
    });

    const editBtn=document.createElement("span");
    editBtn.className="edit";
    editBtn.innerHTML="✐";
    li.appendChild(editBtn);

    editBtn.addEventListener("click",function(e){
        e.stopPropagation();
        const input= document.createElement('input');
        input.type= 'text';
        input.value= taskobj.value;
        input.className= 'edit-input';

        li.replaceChild(input, textSpan);
        input.focus();

        input.addEventListener('keypress',function(e){
            if(e.key==='Enter') {
                finishEditing(input, taskobj.value);
            }
        });

        input.addEventListener('blur', function () {
            finishEditing(input, taskobj.value);
        });
    });
    li.addEventListener('click', function (e) {
            if(e.target.classList.contains('close') || 
            e.target.classList.contains('edit') ||
            li.querySelector('.edit-input')) {
            return;
        }        
        const wasCompleted = li.classList.contains("checked");
        li.classList.toggle('checked');
        const isCompleted = li.classList.contains("checked");
        updatestatus(taskobj.value, isCompleted);
        updateprogress();

        if (!wasCompleted && isCompleted) {
            playCompleteSound();
        }
    });

    document.getElementById('myli').appendChild(li);
    updateprogress();
}
function savetols(taskObj){
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(taskObj);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function loadtasks() {
    const list = document.getElementById("myli");
    list.innerHTML = "";
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    
    if (tasks.length === 0) {
        const randomQuote = quotes.noTasks[Math.floor(Math.random() * quotes.noTasks.length)];
        showNotification("🌸", randomQuote);
    }
    
    tasks.forEach(task => {
        addtodom(task);
    });
}

function removetasks(taskval){
    playDeleteSound();
    let tasks=JSON.parse(localStorage.getItem("tasks")) || [];
    tasks=tasks.filter(task=>task.value!==taskval);
    localStorage.setItem("tasks",JSON.stringify(tasks));
    loadtasks();  
}

function updateprogress(){
    const allTasks=document.querySelectorAll('#myli .task-item');
    const completedTasks=document.querySelectorAll('#myli .task-item.checked');
    const progressbar=document.getElementById('progressbar');

    const total=allTasks.length;
    const completed=completedTasks.length;
    let percent= total=== 0?0:Math.round((completed/total)*100);
    progressbar.style.width=percent+'%';

}
function handleFinishBtn() {
    const finishBtn = document.querySelector("#finishbtn");
    finishBtn.addEventListener("click", () => {
        const allTasks = document.querySelectorAll("#myli .task-item");
        const completedTasks = document.querySelectorAll("#myli .task-item.checked");
        const total = allTasks.length;
        const completed = completedTasks.length;
        if (total > 0) {
            if (total === completed) {
                const randomQuote = quotes.allComplete[Math.floor(Math.random() * quotes.allComplete.length)];
                showNotification("🎉", randomQuote);
                playFinishSound();
            } else {
                const incomplete = total - completed;
                let quote = quotes.incomplete[Math.floor(Math.random() * quotes.incomplete.length)];
                quote = quote.replace('${count}', incomplete); 
                showNotification("🍃", quote);
            }
        }
    });
}
function updatestatus(taskval,isCompleted) {
    let tasks=JSON.parse(localStorage.getItem("tasks")) || [];
    tasks=tasks.map(task => {
        if(task.value===taskval) {
            task.completed=isCompleted;
        }
        return task;
    });
    localStorage.setItem("tasks",JSON.stringify(tasks));
}
function finishEditing(input, oldValue) {
    const newValue = input.value.trim();
    const li = input.parentElement;

    if (newValue === "") {
        alert("Task cannot be empty!");
        li.replaceChild(createTextSpan(oldValue), input);
        return;
    }

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find(t => t.value === oldValue);
    if (task) {
        task.value = newValue;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        loadtasks();
    }
}

function createTextSpan(text) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'task-text';
    return span;
}

function playAddSound() {
    const sound = document.getElementById('addSound');
    sound.currentTime = 0; 
    sound.play().catch(e => console.log("Sound playback prevented:", e));
}

function playCompleteSound() {
    const sound = document.getElementById('completeSound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Sound playback prevented:", e));
}

function playFinishSound() {
    const sound = document.getElementById('finishSound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Sound playback prevented:", e));
}

function playDeleteSound() {
    const sound = document.getElementById('deleteSound');
    sound.currentTime = 0; 
    sound.volume = 0.3; 
    sound.play().catch(e => console.log("Delete sound error:", e));
}
const quotes = {
    noTasks: [
        "The day is yours to shape! Add some tasks to get started.",
        "Every great journey begins with a single task.",
        "A blank canvas awaits your plans.",
        "Your task garden is ready for planting!",
        "The first task is the most magical...",
        "Let's grow some tasks together!",
        "Start with just one tiny task"
    ],
    allComplete: [
        "You've blossomed today! Everything is complete!",
        "Productivity perfection achieved!",
        "Everything’s complete! Enjoy your cupcake break!",
        "You’re a task-completing wizard!",
        "All checked off! Your to-do list is now a ta-da list!",
        "Mission accomplished! Time for a fairy nap!",
        "Task garden fully watered!",
        "You sparkled through every task!"
    ],
    incomplete: [
        "You're ${count} steps closer to your goals!",
        "${count} little seedlings still growing",
        "You're ${count} steps away from magical completion",
        "${count} more petals to add to your bouquet",
        "The garden isn't finished yet - ${count} to go!",
        "${count} tiny clouds will clear with focus"
    ]
};

function showNotification(icon, message, duration = 3000) {
    const container = document.querySelector('.notification-container');
    const notification = container.querySelector('.notification');
    const notifIcon = notification.querySelector('.notification-icon');
    const notifText = notification.querySelector('.notification-text');
    const closeBtn = notification.querySelector('.notification-close'); // Get existing button
    
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    const freshCloseBtn = notification.querySelector('.notification-close');
    
    notifIcon.textContent = icon;
    notifText.textContent = message;
    
    const notifSound = document.getElementById('notifSound');
    notifSound.currentTime = 0;
    notifSound.play().catch(e => console.log("Notification sound error:", e));
    
    container.style.display = 'block';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    freshCloseBtn.onclick = () => {
        container.style.display = 'none';
        clearTimeout(notificationTimeout);
    };
    
    const notificationTimeout = setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            container.style.display = 'none';
        }, 500);
    }, duration);
}
