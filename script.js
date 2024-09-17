//handle comments
var global_author;
var isLoggedin = false;
var comm;
const form = document.getElementById('comment-form');

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(form)
        console.log("I am here");
        var date = document.getElementById("comment_date").value;
        var comment = document.getElementById("comment_comment").value;
        pkgName = document.getElementById("changePackageName").innerText;
        //global_pkg_name = pkgName;
        console.log("The value in the modal  box is ="+date+" "+comment+" "+global_author+" "+userName+" "+pkgName);
        var URL = "http://prabhav11.fyre.ibm.com:8899/api/comment/add"
                                                pkgName = document.getElementById("changePackageName").innerText
                                                $.ajax({
                                                url: URL,
                                                method: "POST",
                                                data : JSON.stringify({"commentDate": date,"packageName": pkgName,"comment" : comment, "authorName": global_author}),
                                                contentType: "application/json",
                                                success: function(result) {
                                                        console.log("pkg name is "+pkgName+" ------"+result)
                                                        //refresh_data(pkgName);
                                                        populateTable(pkgName)
                                                        alert("comment added successfully")
                                                },
                                                failure: function(result) {
                                                }
                                                });

        var element = document.getElementById("comment-form")
        element.reset()
    });

var editedRowIndex;  // To keep track of the edited row index
var editedDate;
var editedComment;
var deletedRowIndex;
let deletedRow;

const form1 = document.getElementById('update-comment-form');
form1.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(form1)
             var editedComment = document.getElementById('editComment').value;
             var URL = "http://prabhav11.fyre.ibm.com:8899/api/update/comment"
                                                pkgName = document.getElementById("changePackageName").innerText
                                                console.log("---------------"+pkgName,editedDate,editedComment,global_author)

                                                $.ajax({
                                                url: URL,
                                                method: "PUT",
                                                data : JSON.stringify({"commentDate": editedDate,"packageName": pkgName,"comment" : editedComment, "authorName": global_author}),
                                                contentType: "application/json",
                                                success: function(result) {
                                                        console.log(result)
                                                        populateTable(pkgName)
                                                },
                                                failure: function(result) {
                                                }
                                                });
});

// Define the number of items per page
const itemsPerPage = 3;

// Initialize variables to keep track of current page and data
let currentPage = 1;
let data2 = [];

//render per package comment history data table
function populateTable(package_name) {
console.log("Populate table pkg name is "+package_name);
var request1 = new XMLHttpRequest()
        request1.open('GET', 'http://prabhav11.fyre.ibm.com:8899/api/comment?packageName='+package_name, true)
        request1.onload = function() {
            data2 = JSON.parse(request1.responseText)
             // Display the first page of data
            if(isLoggedin==false){
                    displayData_not_logged(currentPage)
            }else{
            displayData(currentPage);
            }
        }
        request1.send()
}


function displayData_not_logged(page){
            console.log("data2.length="+data2.length);
            if(data2.length <= 0){
                    if(comm.length === 0)
                    {
                            console.log("No comments ")
                            document.getElementById('summary').innerText="No Comments"
                    }
                    else{
                    console.log("Summary comment "+comm)
                    document.getElementById('summary').innerText=comm
                    comm = ""
                        }
                    document.getElementById('data-table1').setAttribute("hidden",true);
                    document.getElementById('prev-page1').setAttribute("hidden",true);
                    document.getElementById('next-page1').setAttribute("hidden",true);
            }
            if (data2.length > 0){
            document.getElementById('summary').innerText=comm
                    comm = ""
            //document.getElementById('data-table1').style.display = 'block'
            const tableBody = document.querySelector('#data-table1 tbody');
            //tableBody.empty();
            tableBody.innerHTML = '';
            // Calculate the start and end index for the current page
            const startIndex = (page  - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
                    document.getElementById('prev-page1').removeAttribute("hidden");
                    document.getElementById('next-page1').removeAttribute("hidden");
                    document.getElementById('data-table1').removeAttribute("hidden");
            data2.slice(startIndex, endIndex).forEach(function(item,index){
                var row = document.createElement('tr');
                row.innerHTML = '<td style="white-space:nowrap; width:110px">' + item.commentDate + '</td><td style="word-wrap:break-word;">' + item.comment +  '</td><td>' + item.authorName + '</td>';
                tableBody.appendChild(row)
        });
            }

}

function displayData(page){
            const tableBody = document.querySelector('#data-table tbody');
            //tableBody.empty();
            tableBody.innerHTML = '';
            // Calculate the start and end index for the current page
            const startIndex = (page  - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            if(data2.length > 0){
                    document.getElementById('prev-page').removeAttribute("hidden");
                    document.getElementById('next-page').removeAttribute("hidden");
            }

            data2.slice(startIndex, endIndex).forEach(function(item,index){
                var row = document.createElement('tr');
                row.innerHTML = '<td style="white-space:nowrap; width:110px">' + item.commentDate + '</td><td style="word-wrap:break-word;">' + item.comment +  '</td><td>' + item.authorName + '</td>' +
    '<td>' +
    '<a href="javascript:void(0);" onclick="editRow(' + index + ', \''+ item.commentDate+'\',  \''+ item.comment+'\')" class="edit" data-toggle="modal">' +
    '<i class="material-icons" data-toggle="tooltip" title="" data-original-title="Edit"></i>' +
    '</a>' +
    '<a href="javascript:void(0);" onclick="deleteRow(' + index + ',  \''+ item.commentDate+'\')" class="delete" data-toggle="modal">' +
    '<i class="material-icons" data-toggle="tooltip" title="" data-original-title="Delete"></i>' +
    '</a>' +
    '</td>';
                tableBody.appendChild(row)
        });

}

const prevPageButton = document.querySelector('#prev-page');
const nextPageButton = document.querySelector('#next-page');

const prevPageButton1 = document.querySelector('#prev-page1');
const nextPageButton1 = document.querySelector('#next-page1');

prevPageButton1.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayData_not_logged(currentPage)
  }
});

nextPageButton1.addEventListener('click', () => {
  const totalPages = Math.ceil(data2.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayData_not_logged(currentPage)
    }
});


prevPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayData(currentPage);
  }
});

nextPageButton.addEventListener('click', () => {
  const totalPages = Math.ceil(data2.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayData(currentPage);
  }
});

 // Edit row function
function editRow(index,date,comment) {
            // Store the edited row index
            editedRowIndex = index;
            editedDate = date;
            editedComment = comment;
            // Get the current name from the table
            var comment = document.querySelector('#data-table tbody').rows[index].cells[1].innerHTML;
            var date = document.querySelector('#data-table tbody').rows[index].cells[0].innerHTML;
            var author = document.querySelector('#data-table tbody').rows[index].cells[2].innerHTML;

            // Set the current name in the edit modal
            document.getElementById('editComment').value = comment;
            document.getElementById('editDate').value = date;
            // Show the edit modal
            document.getElementById('id002').style.display = 'block';
        }

// Function to save the edited name
function saveEditedComment() {
            // Get the edited name from the modal input
            var editedComment = document.getElementById('editComment').value;
            // Update the table with the edited name
            //document.querySelector('#data-table tbody').rows[editedRowIndex].cells[1].innerHTML = editedComment;
            // Close the edit modal
var URL = "http://prabhav11.fyre.ibm.com:8899/api/update/comment"
                                                pkgName = document.getElementById("changePackageName").innerText
                                                console.log("---------------"+pkgName,editedDate,editedComment,global_author)

                                                $.ajax({
                                                url: URL,
                                                method: "PUT",
                                                data : JSON.stringify({"commentDate": editedDate,"packageName": pkgName,"comment" : editedComment, "authorName": global_author}),
                                                contentType: "application/json",
                                                success: function(result) {
                                                        console.log(result)
                                                        //alert("comment added successfully")
                                                //writetoFile(userName,pkgName,writetype,newComment)
                                                },
                                                failure: function(result) {
                                                }
                                                });

            // You can also send the edited data to the API here if needed
        }

        // Function to close the edit modal
        function closeEditModal() {
            document.getElementById('id002').style.display = 'none';
}

function deleteRow(index,date) {
    // Store the row element for later use
    console.log('Row data:',date);
    deletedRowIndex = index;
    deletedRow = date;
    // Show the delete confirmation modal
    document.getElementById('deleteModal').style.display = 'block';
}

// Function to confirm the deletion
function confirmDelete() {
    // Retrieve the row index from the data attribute
    // Close the delete confirmation modal

    pkgName = document.getElementById("changePackageName").innerText
    var URL = "http://prabhav11.fyre.ibm.com:8899/api/delete/comment?packageName="+pkgName+"&commentDate="+deletedRow
                                                $.ajax({
                                                url: URL,
                                                method: "DELETE",
                                                contentType: "application/json",
                                                success: function(result) {
                                                        populateTable(pkgName)
                                                closeDeleteModal()
                                                },
                                                failure: function(result) {
                                                }
                                                });


    // Remove the row from the table
}

// Function to close the delete confirmation modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

//Creates the Legend Table
function createLegend() {
    p = document.createElement('p')
    p.setAttribute('id','recipeRow')
    p.style.display = "none"
    mainContainer.appendChild(p)
    const legendTableContainer = document.getElementById('legendTable')
    textlegend = document.createElement('h5')
    textlegend.setAttribute('class', "legendHeadTitle")
    textlegend.setAttribute('id',"legendTitle")
    textlegend.innerText = "Legends"
    legendTableContainer.appendChild(textlegend)
    var legend = ["NA", "All Good", "Failed < 24hrs. Need to Check", "Failed 2 times. Need Attention", "Jenkins Broken", "Broken", "Job not run"]
    var legendTable = document.createElement("table")
    legendTable.setAttribute('class', 'legendTable')
    var tr = legendTable.insertRow(-1);
    for (var i = 0; i < legend.length; i++) {
        var th = document.createElement("th");
        th.setAttribute('class', 'legendHeader')
        th.setAttribute('title',legend[i])
        th.innerHTML = legend[i];
        if (i == 0) { th.style.backgroundColor = "RGB(166,166,166)" } else if (i == 1) { th.style.backgroundColor = "RGB(112,173,71)" } else if (i == 2) { th.style.backgroundColor = "RGB(255,255,0)" } else if (i == 3) { th.style.backgroundColor = "RGB(255,165,0)" } else if (i == 4) { th.style.backgroundColor = "RGB(255,140,140)" } else if (i == 5) { th.style.backgroundColor = "RGB(255,0,0)" } else { th.style.backgroundColor = "RGB(255,255,255)" }
        tr.appendChild(th);
    }
    legendTableContainer.appendChild(legendTable)
}

//Get failure Dates of Failed Jobs while populating the Package Table
function formatDate(formattedDate) {
    if (formattedDate != null) {
        formattedDate = (formattedDate.substr(5, 5)).replace("-", "/")
        return formattedDate
    }
    else {return ""}
}

//Color code the cells
function classifyErrors(tr, ratio, broken, failureDate, successDate, col, notIndividualFailure) {
    if (broken) {tr.cells[col].style.backgroundColor = "RGB(255,0,0)"
        if (notIndividualFailure) {tr.cells[col].innerText = formatDate(failureDate)}
    } else if (ratio < 0) { tr.cells[col].style.backgroundColor = "RGB(166,166,166)"
    } else if (ratio == 0) {
        tr.cells[col].style.backgroundColor = "RGB(112,173,71)"
        if (notIndividualFailure) {tr.cells[col].innerText = formatDate(successDate) }
    } else if (ratio > 0 && ratio < 2) {
        tr.cells[col].style.backgroundColor = "RGB(255,255,0)"
        if (notIndividualFailure) { tr.cells[col].innerText = formatDate(failureDate) }
    } else if (ratio >= 2 && ratio < 3) {
        tr.cells[col].style.backgroundColor = "RGB(255,165,0)"
        if (notIndividualFailure) { tr.cells[col].innerText = formatDate(failureDate) }
    } else if (ratio >= 3) {
        tr.cells[col].style.backgroundColor = "RGB(255,140,140)"
        if (notIndividualFailure) { tr.cells[col].innerText = formatDate(failureDate) }
    }
}

//Color code the distro Table
function ClassifyErrors(td, ratio, broken, failureDate, notIndividualFailure) {
    if (broken) {td.style.backgroundColor = "RGB(255,0,0)"
        if (notIndividualFailure) {td.innerText = formatDate(failureDate)}
    } else if (ratio < 0) {
        td.style.backgroundColor = "RGB(166,166,166)"
    } else if (ratio < 1) { td.style.backgroundColor = "RGB(112,173,71)"
    } else if (ratio >= 1 && ratio < 2) {
        td.style.backgroundColor = "RGB(255,255,0)"
        td.setAttribute("data-tooltip",formatDate(failureDate))
        //td.innerText = formatDate(failureDate)
        if (notIndividualFailure) { td.innerText = formatDate(failureDate) }
    } else if (ratio >= 2 && ratio < 3) {
        td.style.backgroundColor = "RGB(255,165,0)"
        td.setAttribute("data-tooltip",formatDate(failureDate))
        if (notIndividualFailure) { td.innerText = formatDate(failureDate) }
    } else if (ratio >= 3) {
        td.style.backgroundColor = "RGB(255,140,140)"
        td.setAttribute("data-tooltip",formatDate(failureDate))
        if (notIndividualFailure) { td.innerText = formatDate(failureDate) }
    }
}

//Create the Package Table
function createPackageTable() {
    var request = new XMLHttpRequest()
    request.open('GET', 'http://ps31.fyre.ibm.com:8888/api/distros', true)
    request.onload = function() {
        var data = JSON.parse(this.responseText)
        var col = ["#", "Package Name", "Recipe", "Dockerfile", "CI Links", "Image", "Binary", "Comment", "Size", "Owner"];
        createPackageHeader(col)
        var request1 = new XMLHttpRequest()
        request1.open('GET', 'http://ps31.fyre.ibm.com:8888/api/summary', true)
        request1.onload = function() {
            var data1 = JSON.parse(this.responseText)
            displayAll(data1)
            for (var i = 0; i < data1.length; i++) {
                createPackageBody(data1,col,i)
            }
            if(document.getElementById("selectOwner") == null)
            {applyFilter(data1,col)}
        }
        request1.send()
    }
    request.send()
}

//Create the Header of the Package Table
function createPackageHeader(col) {
    var tr = document.getElementById("packageTable").insertRow(-1);
    for (var i = 0; i < col.length; i++) {;
        var th = document.createElement("th");
        th.setAttribute('class', 'packageHeader')
        th.setAttribute('title',col[i])
        if(col[i] == "Package Name"){th.setAttribute('colspan','2')}
        else if(col[i] == "Comment"){th.setAttribute('colspan','2')}
        th.innerHTML = col[i];
        tr.appendChild(th);
    }
    document.getElementById("packageTableHeader").appendChild(tr)
}

//Create the Package Table Body and Create the Distro Table Structure
function createPackageBody(data1,col,i) {
    var tr = packageTable.insertRow(-1)
    tr.setAttribute('id','packageTableRow')
    for (var j = 0; j < col.length; j++) {
        var td = document.createElement("td");
        if(col[j] == "Package Name")
        {td.setAttribute('colspan','2')}
        if(col[j] == "Comment")
        {td.setAttribute('colspan','2')}
        td.setAttribute('class', 'packageValue')
        td.setAttribute('id',data1[i].packageName+j)
        tr.appendChild(td)
    }
    document.getElementById("packageTableBody").appendChild(tr)
    populatePackageTableBody(data1,tr,i,col)
    tr.onclick = (function() {
        var packageData = data1
        var rowNum = i
        var distroTable = document.getElementById("distroTable")
        if (distroTable !=null)
            {
                distroTable.remove();
                distroTable = null;
            }
        if (distroTable == null)
        {
            var distroTable = document.createElement("table")
            distroContainer.appendChild(distroTable)
            distroTable.setAttribute('class', 'distroTable responsive-table')
            distroTable.setAttribute('id', 'distroTable')
            var packageName = this.cells[1].innerText
            var tr = distroTable.insertRow(-1)
            var th = document.createElement("th");
            var a = document.createElement("a");
            a.setAttribute("id","distroHyperlink")
            th.appendChild(a)
            th.setAttribute('colspan', '5')
            a.innerHTML = this.cells[1].innerText;
            a.href = ("http://ps31.fyre.ibm.com:8080/job/" + this.cells[1].innerText).trim()
            a.style.color = "black"
            tr.appendChild(th);
            var tr = distroTable.insertRow(-1)
            var th = document.createElement("th");
            th.setAttribute('colspan', '5')
            th.setAttribute('height', "40px")
            th.innerHTML = this.cells[7].innerText;
            tr.appendChild(th);
            var request = new XMLHttpRequest()
            request.open('GET', 'http://ps31.fyre.ibm.com:8888/api/distros', true)
            request.onload = function() {
                if(packageData[rowNum].packageName != "K8S-CSI-Components"){
                    //packageData[rowNum].verification != "Image"){
                    var tr = distroTable.insertRow(-1)
                    var th = document.createElement("th");
                    th.setAttribute('colspan', '5')
                    th.innerHTML = "Recipe";
                    tr.appendChild(th);
                }
                var data = JSON.parse(this.responseText)
                var recipeCol = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i] != "Dockerfile" && data[i] != "Image" && data[i] != "Binary") {
                        if(data[i].match(/^s-/g) == null)
                        { recipeCol.push(data[i])}
                    }
                }
                if((recipeCol.length % 5) > 0){recipeRow = Math.floor(recipeCol.length / 5) + 1 } else {recipeRow = recipeCol.length / 5}

                var binaryCol = [];
                var imageCol = [];
                var binaryRow;
                var imageVerified = false;
                var binaryVerified = false;
                var bothVerified = false;
                if(packageData[rowNum].verification != null && packageData[rowNum].verification == "Binary" && packageData[rowNum].binaryNames != null){
                        var binaries = packageData[rowNum].binaryNames.split(',');
                        for (var i = 0; i < binaries.length; i++) {
                            binaryCol.push(binaries[i]);
                        }
                        binaryVerified = true;
                        if((binaryCol.length % 5) > 0){binaryRow = Math.floor(binaryCol.length / 5) + 1 } else {binaryRow = binaryCol.length / 5}
                } else if(packageData[rowNum].verification != null && packageData[rowNum].verification == "Image" && packageData[rowNum].imageNames != null){
                        var images = packageData[rowNum].imageNames.split(',');
                        for (var i = 0; i < images.length; i++) {
                            imageCol.push(images[i]);
                        }
                        imageVerified = true;
                        imageRow = imageCol.length
                } else if(packageData[rowNum].verification != null && packageData[rowNum].binaryNames != null && packageData[rowNum].imageNames != null){
                    var binaries = packageData[rowNum].binaryNames.split(',');
                        for (var i = 0; i < binaries.length; i++) {
                            binaryCol.push(binaries[i]);
                        }
                    var images = packageData[rowNum].imageNames.split(',');
                        for (var i = 0; i < images.length; i++) {
                            imageCol.push(images[i]);
                        }
                        bothVerified = true;
                    if((binaryCol.length % 5) > 0){binaryRow = Math.floor(binaryCol.length / 5) + 1 } else {binaryRow = binaryCol.length / 5}
                    imageRow = imageCol.length
                }

                if(packageData[rowNum].packageName != "K8S-CSI-Components"){
                    document.getElementById("recipeRow").innerText = 3 + recipeRow;
                    populateDistroTable(data1,recipeRow,recipeCol,distroTable, true, null)
                    if(rights >= 2)
                    {updateList(data1,recipeRow,recipeCol,binaryRow,binaryCol,false)}
                }
                if(binaryVerified){
                    var tr = distroTable.insertRow(-1)
                    var th = document.createElement("th");
                    th.setAttribute('colspan', '5')
                    th.innerHTML = "Binary";
                    tr.appendChild(th);
                    populateDistroTable(data1,binaryRow,binaryCol,distroTable, false, packageData[rowNum].verification)
                    if(rights >= 2)
                    {updateList(data1,recipeRow,recipeCol,binaryRow,binaryCol,true)}
                } else if(imageVerified){
                    var tr = distroTable.insertRow(-1)
                    var th = document.createElement("th");
                    th.setAttribute('colspan', '5')
                    th.innerHTML = "Images";
                    tr.appendChild(th);
                    populateDistroTable(data1,imageRow,imageCol,distroTable, false, packageData[rowNum].verification)
                    if(rights >= 2)
                    {updateList(data1,recipeRow,recipeCol,binaryRow,binaryCol,true)}
                } else if (bothVerified){
                    var tr = distroTable.insertRow(-1)
                    var th = document.createElement("th");
                    th.setAttribute('colspan', '5')
                    th.innerHTML = "Binary";
                    tr.appendChild(th);
                    populateDistroTable(data1,binaryRow,binaryCol,distroTable, false, "Binary")
                    var tr = distroTable.insertRow(-1)
                    var th = document.createElement("th");
                    th.setAttribute('colspan', '5')
                    th.innerHTML = "Images";
                    tr.appendChild(th);
                    populateDistroTable(data1,imageRow,imageCol,distroTable, false, "Image")
                    if(rights >= 2)
                    {updateList(data1,recipeRow,recipeCol,binaryRow,binaryCol,true)}
                }
                //activateDarkMode()

                console.log("before reading cells")

                let disTable = document.getElementById("distroTable");
                console.log("disTable",disTable)
                var cells = disTable.getElementsByTagName("th");

                // var tooltip = document.createElement("div");
                // tooltip.classList.add("tooltip");
                // //tooltip.style.display = "none";
                // tooltip.style.position = "absolute";
                // tooltip.style.backgroundColor = "white";
                // tooltip.style.border = "1px solid black";
                // tooltip.style.padding = "5px";

                //document.body.appendChild(tooltip);

                console.log("cells",cells)
                console.log("Size of array:", cells.length);

                Array.from(cells).forEach(function(thElement) {
                    thElement.addEventListener("mouseenter", function(event) {
                      // Show tooltip
                      var tooltipText = thElement.getAttribute("data-tooltip");
                      const tooltip = document.getElementById('dateTooltip');
                      if (tooltipText) {
                      console.log("tooltipText",tooltipText)
                      tooltip.textContent = tooltipText; // Set tooltip content
                      tooltip.style.display = "block";
                      tooltip.style.top = `${event.clientY - tooltip.offsetHeight}px`; // Adjusted positioning
                      tooltip.style.left = `${event.clientX}px`;
                      tooltip.style.zIndex = '9999';
                      }
                    });

                    thElement.addEventListener("mouseleave", function() {
                      // Hide tooltip
                      document.getElementById('dateTooltip').style.display = 'none';
                    });
                  });

                    // Add event listeners to each cell
                // Array.from(cells).forEach(function(cell) {
                //     console.log("cell",cell)
                //     console.log("cell",cell.textContent)
                // // Get the value of the data-tooltip attribute
                // var tooltipText = cell.getAttribute("data-tooltip");

                // console.log("tooltipText",tooltipText)
                // // If data-tooltip attribute is present, create a tooltip element and attach it to the cell

                // if (tooltipText) {
                // console.log("inside if after text")
                // var tooltip = document.getElementById("tooltip");
                // //tooltip.classList.add("tooltip");
                // tooltip.textContent = tooltipText;
                // cell.appendChild(tooltip);

                // // Show tooltip on mouseover
                // cell.addEventListener("mouseover", function() {
                // tooltip.style.display = "block";
                // });

                // // Hide tooltip on mouseout
                // cell.addEventListener("mouseout", function() {
                // tooltip.style.display = "none";
                // });
                // }
                // });
            }
            request.send()
        }
        else
        {
            document.getElementById("distroPkgName").innerText = this.cells[1].innerText;
            document.getElementById("deleteRSPkgName").innerText = this.cells[1].innerText;
            a = document.getElementById("distroHyperlink")
            a.innerHTML = this.cells[1].innerText;
            a.href = ("http://ps31.fyre.ibm.com:8080/job/" + this.cells[1].innerText).trim()
            distroTable.rows[1].cells[1].innerText = this.cells[7].innerText
            var request = new XMLHttpRequest()
            request.open('GET', 'http://ps31.fyre.ibm.com:8888/api/distros', true)
            request.onload = function() {
                var data = JSON.parse(this.responseText)
                var recipeCol = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i] != "Dockerfile" && data[i] != "Image" && data[i] != "Binary") {
                        if(data[i].match(/^s-/g) == null)
                        { recipeCol.push(data[i])}
                    }
                }
                if((recipeCol.length % 5) > 0){recipeRow = Math.floor(recipeCol.length / 5) + 1 } else {recipeRow = recipeCol.length / 5}
                populateDistroTable2(data1,distroTable,recipeCol)
                activateDarkMode()
            }
            request.send()
        }


    })
    tr.ondblclick = ( function() {
        if (isLoggedin == false){
            document.getElementById("changePackageName1").innerText = this.cells[1].innerText
            comm = this.cells[7].innerText;
            console.log("comm value is "+comm)
            populateTable(document.getElementById("changePackageName1").innerText);
            document.getElementById("myModal_not_loggedin").style.display = "block"
        }
        if(rights >= 1)
        {
            if(this.cells[2].style.backgroundColor == "rgb(255, 0, 0)")
            {
                document.getElementById("recipeBroken").checked = true;
                document.getElementById("previousRecipeBroken").checked = true;
            }
            else
            {
                document.getElementById("recipeBroken").checked = false;
                document.getElementById("previousRecipeBroken").checked = false;
            }
            if(this.cells[3].style.backgroundColor == "rgb(255, 0, 0)")
            {
                document.getElementById("dockerBroken").checked = true;
                document.getElementById("previousDockerBroken").checked = true;
            }
            else
            {
                document.getElementById("dockerBroken").checked = false;
                document.getElementById("previousDockerBroken").checked = false;
            }
            if(this.cells[5].style.backgroundColor == "rgb(255, 0, 0)")
            {
                document.getElementById("imageBroken").checked = true;
                document.getElementById("previousImageBroken").checked = true;
            }
            else
            {
                document.getElementById("imageBroken").checked = false;
                document.getElementById("previousImageBroken").checked = false;
            }
            if(this.cells[6].style.backgroundColor == "rgb(255, 0, 0)")
            {
                document.getElementById("binaryBroken").checked = true;
                document.getElementById("previousBinaryBroken").checked = true;
            }
            else
            {
                document.getElementById("binaryBroken").checked = false;
                document.getElementById("previousBinaryBroken").checked = false;
            }
            document.getElementById("imageLabel").style.display = "none"
            document.getElementById("newImageSize").style.display = "none"
            document.getElementById("changePackageName").innerText = this.cells[1].innerText
            //global_pkg_name = document.getElementById("changePackageName").innerText
            populateTable(document.getElementById("changePackageName").innerText);
            document.getElementById("previousComment").innerHTML = "<strong>"+this.cells[7].innerText+"</strong>";
            comm = document.getElementById("previousComment").innerText;
            document.getElementById("newComment").value = document.getElementById("previousComment").innerText
            document.getElementById("recipeBrokenContainer").style.display = "block"
            document.getElementById("dockerBrokenContainer").style.display = "block"
                document.getElementById("binaryBrokenContainer").style.display = "block"
                document.getElementById("imageBrokenContainer").style.display = "block"
            document.getElementById("myModal").style.display = "block"

        }
        if(rights >= 3)
        {
            document.getElementById("newImageSize").value = this.cells[8].innerText
            document.getElementById("previousImageSize").innerHTML = "<strong>"+this.cells[8].innerText+"</strong>";
            document.getElementById("imageLabel").style.display = "block"
            document.getElementById("newImageSize").style.display = "block"
        }
    })
}

//Populate the Package Table Body
function populatePackageTableBody(data1,tr,i,col) {
    var ciLogo=data1[i].ciLogo
    var ciJob=data1[i].ciJob
    tr.cells[0].innerText = i+1
    tr.cells[1].innerText = data1[i].packageName
    tr.cells[9].innerText = (data1[i].owner)[0].toUpperCase() + (data1[i].owner).slice(1)
    tr.cells[7].innerText = data1[i].comment
    tr.cells[8].innerText = data1[i].imageSize

    // Populate CI status
    if(ciLogo){
        tr.cells[4].innerHTML =  "<a href="+ciJob+"><img src="+ciLogo+" alt='Build Status' width='75' /></a>"
    }
    else{
        tr.cells[4].innerText = ""
    }

    if (data1[i].verification != null && data1[i].verification.includes("Binary"))
    {
        if(data1[i].ratio < 0){
            tr.cells[2].style.backgroundColor = "RGB(166,166,166)"
        }
            classifyErrors(tr, data1[i].binaryRatio, data1[i].binaryBroken, data1[i].failureTime, data1[i].jobLastRunTime, 6, true)
    }
    else
    {
        if(data1[i].binaryRatio < 0){
            tr.cells[6].style.backgroundColor = "RGB(166,166,166)"
        }
        classifyErrors(tr, data1[i].ratio, data1[i].broken, data1[i].failureTime, data1[i].jobLastRunTime, 2, true)
    }

    //if(data1[i].packageName != "Sysdig"){
      //  classifyErrors(tr, data1[i].scriptRatio, false, data1[i].scriptFailureTime, data1[i].jobLastRunTime, 4, true)
   // } else {
     //   classifyErrors(tr, data1[i].scriptRatio, false, data1[i].scriptFailureTime, data1[i].scriptLastRunTime, 4, true)
    //}

    countCollection = {}
    distroFailure = data1[i].distroFailure
    if (distroFailure != "") {
        failureCount = data1[i].failureCount
        var counts = failureCount.split(",")
        for (var j = 0; j < counts.length; j++) {
            Count = counts[j].split("=")
            countCollection[Count[0].trim()] = Count[1]
        }
    }
    var failureName = distroFailure.split(",")
    for (var j = 0; j < failureName.length; j++) {
        distro = failureName[j].trim()
        if (distro == "Dockerfile") {
            if (data1[i].dockerBroken == true) {
                tr.cells[3].style.backgroundColor = "RGB(255,0,0)"
            } else {
                classifyErrors(tr, countCollection[distro], false, data1[i].failureTime, null, 3, false)
            }
            tr.cells[3].innerText = formatDate(data1[i].dockerFailureTime)
        }
            else if (distro == "Image") {
                if (data1[i].imageBroken == true) {
                        tr.cells[5].style.backgroundColor = "RGB(255,0,0)"
                } else {
                        classifyErrors(tr, countCollection[distro], false, data1[i].failureTime, null, 5, false)
            }
            tr.cells[5].innerText = formatDate(data1[i].imageFailureTime)
        }
    }
    distroSuccess = data1[i].distroSuccess
    var successName = distroSuccess.split(",")
    for (var j = 0; j < successName.length; j++) {
        distro = successName[j].trim()
        //if (distro != "Scripts") {
            if (distro == "Dockerfile") {
                tr.cells[3].style.backgroundColor = "RGB(112,173,71)"
                        tr.cells[3].innerText = formatDate(data1[i].dockerLastRunTime)
                }
            else if (distro == "Image") {
                        tr.cells[5].style.backgroundColor = "RGB(112,173,71)"
                        tr.cells[5].innerText = formatDate(data1[i].jobLastRunTime)
                }
    //}
    }
    unavailableDistros = data1[i].unavailableDistros
    if (unavailableDistros != null) {
        var unavailableNames = unavailableDistros.split(",")
        for (var j = 0; j < unavailableNames.length; j++) {
            distro = unavailableNames[j].trim()
            if (distro == "Dockerfile") {
                tr.cells[3].style.backgroundColor = "RGB(166,166,166)"
            }
            else if (distro == "Image") {
                tr.cells[5].style.backgroundColor = "RGB(166,166,166)"
        }
        else if (distro == "CI") {
            tr.cells[4].style.backgroundColor = "RGB(166,166,166)"
        }
        }
    }
    for(j=0 ; j < col.length ; j++)
    {
        document.getElementById(tr.cells[1].innerText+j).setAttribute('title',tr.cells[j].innerText);
    }
    if (data1[i].dockerBroken == true) {
        tr.cells[3].style.backgroundColor = "RGB(255,0,0)"
        tr.cells[3].innerText = formatDate(data1[i].dockerFailureTime)
    }
    if (data1[i].imageBroken == true) {
        tr.cells[5].style.backgroundColor = "RGB(255,0,0)"
        tr.cells[5].innerText = formatDate(data1[i].imageFailureTime)
    }
}

function saveContent() {
    document.getElementById("myModal").style.display = "none"
    var newComment = document.getElementById("newComment").value
    var rows = document.getElementById("packageTable").rows;
    for(var i = 1; i < rows.length ; i++) {
        if(rows[i].cells[1].innerText == document.getElementById("changePackageName").innerText)
        {
            if(document.getElementById("previousBinaryBroken").checked == document.getElementById("binaryBroken").checked)
            {
                if(document.getElementById("previousImageBroken").checked == document.getElementById("imageBroken").checked)
                {
                        if(document.getElementById("previousDockerBroken").checked == document.getElementById("dockerBroken").checked)
                        {
                                if(document.getElementById("previousRecipeBroken").checked == document.getElementById("recipeBroken").checked)
                                {
                                        if(newComment != document.getElementById("previousComment").innerText)
                                        {
                                                rows[i].cells[7].innerText = newComment
                                                var URL = "http://ps31.fyre.ibm.com:8888/api/package/" + rows[i].cells[1].innerText +"/comment"
                                                pkgName = document.getElementById("changePackageName").innerText;
                                                writetype = "Change Comment"
                                                $.ajax({
                                                url: URL,
                                                method: "PUT",
                                                data : JSON.stringify({"comment" : newComment}),
                                                contentType: "application/json",
                                                success: function(result) {
                                                writetoFile(userName,pkgName,writetype,newComment)
                                                },
                                                failure: function(result) {
                                                }
                                                });
                                        }
                                }
                        }
                }
            }
            if(document.getElementById("previousRecipeBroken").checked != document.getElementById("recipeBroken").checked)
            {
                var pkgName = rows[i].cells[1].innerText
                if(document.getElementById("recipeBroken").checked == true)
                {
                    writetype = "Set Recipe Broken"
                    $.ajax({
                        url : "http://ps31.fyre.ibm.com:8888/api/broken/" + pkgName,
                        method: "PUT",
                        data : JSON.stringify({"comment" : newComment}),
                        contentType: "application/json",
                        success : function(result)
                        {
                            writetoFile(userName,pkgName,writetype,newComment)
                        }
                    });
                }
                else {
                    writetype = "Reset Recipe Broken"
                    $.ajax({
                        url : "http://ps31.fyre.ibm.com:8888/api/broken/" + pkgName,
                        method : "DELETE",
                        success : function(result)
                        {
                            writetoFile(userName,pkgName,writetype,"Reset Recipe Broken")
                        }
                    });
                }
            }
            if(document.getElementById("previousDockerBroken").checked != document.getElementById("dockerBroken").checked)
            {
                var pkgName = rows[i].cells[1].innerText
                if(document.getElementById("dockerBroken").checked == true)
                {
                    writetype = "Set Docker Broken"
                    $.ajax({
                        url : "http://ps31.fyre.ibm.com:8888/api/broken/" + pkgName,
                        method: "PUT",
                        data : JSON.stringify({"type" : "Dockerfile", "comment" : newComment}),
                        contentType: "application/json",
                        success : function(result)
                        {
                            writetoFile(userName,pkgName,writetype,newComment)
                        }
                    });
                }
                else {
                    writetype = "Reset Docker Broken"
                    $.ajax({
                        url : "http://ps31.fyre.ibm.com:8888/api/broken/" + pkgName + "?type=Dockerfile",
                        method : "DELETE",
                        success : function(result)
                        {
                            writetoFile(userName,pkgName,writetype,"Reset Docker Broken")
                        }
                    });
                }
            }
            if(document.getElementById("previousImageBroken").checked != document.getElementById("imageBroken").checked)
            {
                var pkgName = rows[i].cells[1].innerText
                if(document.getElementById("imageBroken").checked == true)
                {
                    writetype = "Set Image Broken"
                    $.ajax({
                        url : "http://ps31.fyre.ibm.com:8888/api/broken/" + pkgName,
                        method: "PUT",
                        data : JSON.stringify({"type" : "Image", "comment" : newComment}),
                        contentType: "application/json",
                        success : function(result)
                        {
                            writetoFile(userName,pkgName,writetype,newComment)
                        }
                    });
                }
                else {
                    writetype = "Reset Image Broken"
                    $.ajax({
                        url : "http://ps31.fyre.ibm.com:8888/api/broken/" + pkgName + "?type=Image",
                        method : "DELETE",
                        success : function(result)
                        {
                            writetoFile(userName,pkgName,writetype,"Reset Image Broken")
                        }
                    });
                }
            }
            if(document.getElementById("previousBinaryBroken").checked != document.getElementById("binaryBroken").checked)
            {
                var pkgName = rows[i].cells[1].innerText
                if(document.getElementById("binaryBroken").checked == true)
                {
                    writetype = "Set Binary Broken"
                    $.ajax({
                        url : "http://ps31.fyre.ibm.com:8888/api/broken/" + pkgName,
                        method: "PUT",
                        data : JSON.stringify({"type" : "Binary", "comment" : newComment}),
                        contentType: "application/json",
                        success : function(result)
                        {
                            writetoFile(userName,pkgName,writetype,newComment)
                        }
                    });
                }
                else {
                    writetype = "Reset Binary Broken"
                    $.ajax({
                        url : "http://ps31.fyre.ibm.com:8888/api/broken/" + pkgName + "?type=Binary",
                        method : "DELETE",
                        success : function(result)
                        {
                            writetoFile(userName,pkgName,writetype,"Reset Binary Broken")
                        }
                    });
                }
            }
            if (rights >= 3)
            {
                var newImageSize = document.getElementById("newImageSize").value
                if(newImageSize != document.getElementById("previousImageSize").innerText)
                {
                    rows[i].cells[6].innerText = newImageSize
                    var URL = "http://ps31.fyre.ibm.com:8888/api/package/" + rows[i].cells[1].innerText +"/imageSize"
                    pkgName = document.getElementById("changePackageName").innerText;
                    writetype = "Change ImageSize"
                    $.ajax({
                        url: URL,
                        method: "PUT",
                        data : JSON.stringify({"imageSize" : newImageSize}),
                        contentType: "application/json",
                        success: function(result) {
                            writetoFile(userName,pkgName,writetype,newImageSize)
                        },
                        failure: function(result) {
                        }
                    });
                }
            }
        }
    }
}

function closeModal() {
    document.getElementById("myModal").style.display = "none"
}
function closeModal_not_loggedin() {
    document.getElementById("myModal_not_loggedin").style.display = "none"
}

//Populate the Distro Table
function populateDistroTable(data1,row,col,distroTable,recipe,verification) {
    z = -1
    do {
        z++
    }while(data1[z].packageName != distroTable.rows[0].cells[0].innerText)
    x = 0
    distroSuccess = data1[z].distroSuccess
    var successName = distroSuccess.split(",")
    for(i=0;i<successName.length;i++){successName[i] = successName[i].trim()}
    unavailableDistros = data1[z].unavailableDistros
    if (unavailableDistros != null) {
        var unavailableNames = unavailableDistros.split(",")
        for(i=0;i<unavailableNames.length;i++){unavailableNames[i] = unavailableNames[i].trim()}
    }
    countCollection = {}
    distroFailure = data1[z].distroFailure
    if (distroFailure != "") {
        failureCount = data1[z].failureCount
        var counts = failureCount.split(",")
        for (var j = 0; j < counts.length; j++) {
            Count = counts[j].split("=")
            countCollection[Count[0].trim()] = Count[1]
        }
    }
    var failureName = distroFailure.split(",")
    for(i=0;i<failureName.length;i++){failureName[i] = failureName[i].trim()}

    if(recipe){
        for (i = 0 ; i < row ; i ++)
        {
            tr = distroTable.insertRow(-1)
            for (j = 0; j < 5 ; j++,x++)
            {
                td = document.createElement('th')
                td.innerText = ""
                const keyValuePairs = data1[z].distroFailureTime.split(', ');

                        // Convert the array of key-value pairs into an object (map)
                        const distroFailureTimeMap = keyValuePairs.reduce((acc, pair) => {
                        const [key, value] = pair.split('=');
                                acc[key] = value;
                                return acc;
                        }, {});
                const keyValueLastRun = data1[z].distroLastRunTime.split(', ');

                        // Convert the array of key-value pairs into an object (map)
                        const lastRunTimeMap = keyValueLastRun.reduce((acc, pair) => {
                        const [key, value] = pair.split('=');
                                acc[key] = value;
                                return acc;
                        }, {});
                if(col[x] != null) {
                    td.innerText = col[x]
                    if (failureName.find(element => element == col[x]))
                    {   console.log("failure name:",failureName)
                        console.log("data[z]",data1[z])
                        console.log(data1[z].distroFailureTime)
                        console.log(data1[z].failureTime)
                        console.log("td.innerText", td.innerText)
                        ClassifyErrors(td,countCollection[col[x]],false,distroFailureTimeMap[td.innerText],false)
                    }
                    if(successName.find(element => element == col[x]))
                    {
                        td.style.backgroundColor = "rgb(112,173,71)"
                        console.log("lastRunDate", lastRunTimeMap[td.innerText])
                        //if (lastRunTimeMap[td.innerText]!=null){td.setAttribute("data-tooltip",formatDate(lastRunTimeMap[td.innerText]))}

                    }
                    if(unavailableNames.find(element => element == col[x]))
                    {
                        td.style.backgroundColor = "rgb(166,166,166)"
                    }
                    if(td.style.backgroundColor == ""){ td.style.backgroundColor = "white"}
                }
                tr.appendChild(td)
            }
        }
    } else if(verification == "Binary"){
        tr = distroTable.insertRow(-1)
        td = document.createElement('th')
        if (col[x].includes("=")){
            var binaryInfo = col[x].split('=');
            var a = document.createElement("a");
            a.setAttribute("id","binaryHyperlink")
            td.appendChild(a)
            a.innerHTML = binaryInfo[0];
            a.href = binaryInfo[1];
            a.style.color = "black"
            td.setAttribute('colspan', '5')
            tr.appendChild(td)
        } else {
            td.innerText = col[x]
            td.setAttribute('colspan', '5')
            tr.appendChild(td)
        }
    } else if(verification == "Image") {
            for (i = 0 ; i < row ; i ++)
            {
                tr = distroTable.insertRow(-1)
                td = document.createElement('th')
                if(col[i] != null && col[i].includes("=")) {
                    var imageInfo = col[i].split('=');
                    var a = document.createElement("a");
                    a.setAttribute("id","imageHyperlink")
                    td.appendChild(a)
                    a.innerHTML = imageInfo[0];
                    a.href = imageInfo[1];
                    a.style.color = "black"
                    td.setAttribute('colspan', '5')
                } else {
                    td.innerText = col[i]
                    td.setAttribute('colspan', '5')
                }
                tr.appendChild(td)
            }
    }
}

function populateDistroTable2(data1,distroTable) {
    z = -1
    do {
        z++
    }while(data1[z].packageName != distroTable.rows[0].cells[1].innerText)
    x = 0
    distroSuccess = data1[z].distroSuccess
    var successName = distroSuccess.split(",")
    for(i=0;i<successName.length;i++){successName[i] = successName[i].trim()}
    unavailableDistros = data1[z].unavailableDistros
    if (unavailableDistros != null) {
        var unavailableNames = unavailableDistros.split(",")
        for(i=0;i<unavailableNames.length;i++){unavailableNames[i] = unavailableNames[i].trim()}
    }
    countCollection = {}
    distroFailure = data1[z].distroFailure
    if (distroFailure != "") {
        failureCount = data1[z].failureCount
        var counts = failureCount.split(",")
        for (var j = 0; j < counts.length; j++) {
            Count = counts[j].split("=")
            countCollection[Count[0].trim()] = Count[1]
        }
    }
    var failureName = distroFailure.split(",")
    for(i=0;i<failureName.length;i++){failureName[i] = failureName[i].trim()}
    for(i=3; i < distroTable.rows.length ; i++)
    {
            for(j=0 ; j<5 ; j++)
            {
                td = distroTable.rows[i].cells[j]
                td.style.backgroundColor = ""
                distro = td.innerText;
                if (failureName.find(element => element == distro))
                {
                    ClassifyErrors(td,countCollection[distro],false,data1[z].failureTime, false)
                }
                if(successName.find(element => element == distro))
                {
                    td.style.backgroundColor = "rgb(112,173,71)"
                }
                if(unavailableNames.find(element => element == distro))
                {
                    td.style.backgroundColor = "rgb(166,166,166)"
                }
                if(td.style.backgroundColor == "" && td.innerText != ""){ td.style.backgroundColor = "white"}
        }
    }
}

//Create the Filter buttons and Map to functions
function applyFilter(data1,col)
{
    const selectOwner = document.createElement("select")
    selectOwner.setAttribute('id', 'selectOwner')
    distroContainer.appendChild(selectOwner)
    const selectOption = document.createElement("option")
    selectOption.setAttribute('value', "all")
    var r = document.createTextNode("All")
    selectOption.appendChild(r)
    selectOwner.appendChild(selectOption)
    x = []
    for (var i = 0; i < data1.length; i++) {
        if (!x.find(element => element == data1[i].owner)) {
            x.push(data1[i].owner)
        }
    }
    x = x.sort()
    for (var i = 0; i < x.length ; i++)
    {
        const selectOption = document.createElement("option")
        selectOption.setAttribute('value', x[i])
        var r = document.createTextNode(x[i][0].toUpperCase() + x[i].slice(1))
        selectOption.appendChild(r)
        selectOwner.appendChild(selectOption)
    }
    var showFailure = document.createElement('input');
    showFailure.type = "checkbox";
    showFailure.name = "name";
    showFailure.value = "RecipeFailure";
    showFailure.id = "showFailure";
    var label = document.createElement("label")
    showFailure.setAttribute("class", "showFailureCbox")
    label.setAttribute('class', 'showFailureLabel')
    label.htmlFor = "showFailure"
    label.appendChild(document.createTextNode("Failed Jobs"))
    label.setAttribute("id","showFailureLabel")
    distroContainer.appendChild(showFailure)
    distroContainer.appendChild(label)
    const submitButton = document.createElement("button")
    submitButton.setAttribute('class', 'submitButton')
    submitButton.setAttribute('id', 'submitButton')
    var t = document.createTextNode("Submit");
    submitButton.appendChild(t)
    distroContainer.appendChild(submitButton)
    $( "#submitButton" ).click(function() {
        displayFilteredTable(data1,col);
      });
    distroContainer.appendChild(document.createElement("br"))
    const showEntire = document.createElement("button")
    showEntire.setAttribute('class', 'showEntire')
    showEntire.setAttribute('id', "displayAll")
    showEntire.style.display = "float: right;"
    var t = document.createTextNode("Full View");
    showEntire.appendChild(t)
    distroContainer.appendChild(showEntire)
    showBroken = document.createElement("button")
    showBroken.setAttribute('class', 'showBroken')
    showBroken.setAttribute('id','showBroken')
    showBroken.style = "margin-left: 10px;"
    var t = document.createTextNode("Display Broken");
    showBroken.appendChild(t)
    distroContainer.appendChild(showBroken)
    $("#displayAll").click(function() {
        document.getElementById("entireContainer").style.display = "block"
        document.getElementById("displayEntireContainer").style.display = "block"
        document.getElementById("entirePackageTable").style.display = "table"
        // if(document.getElementById("darkModeSwitch").checked == true)
        // {
        //     document.getElementById("displayEntireContainer").style.backgroundImage = "linear-gradient(#121212, #1F1B24)"
        //     document.getElementById("closeDisplayBtn").style.color = "white";
        // }
        // else
        document.getElementById("displayEntireContainer").style.backgroundImage = "linear-gradient(rgb(184, 236, 214) , rgb(76, 63, 150))"
        document.getElementById("closeDisplayBtn").style.color = "black";

    })
    $("#showBroken").click(function() {
        document.getElementById("selectOwner").value = "all"
        document.getElementById("showFailure").checked = false;
        displayFilteredTable(data1,col)
        displayBroken(data1,col)
    })
}

//Display the filtered Table
function displayFilteredTable(data1,col)
{
    var selectOwner = document.getElementById("selectOwner")
    ownerValue = selectOwner.options[selectOwner.selectedIndex].value
    var showFailure = document.getElementById("showFailure")
    var packageContainer = document.getElementById("packageContainer")
    var element = document.getElementById("packageTableBody")
    if (element != null) { element.parentNode.removeChild(element) }
    packageTableBody = document.createElement("tbody")
    packageTableBody.setAttribute("id","packageTableBody")
    document.getElementById("packageTable").appendChild(packageTableBody)
    for(i=0;i<data1.length;i++)
    {
        if(ownerValue == data1[i].owner || ownerValue == "all")
        {
            createPackageBody(data1,col,i)
        }
    }
    if(showFailure.checked == true)
    {
        rows = document.getElementById("packageTable").rows
        length = rows.length
        ignoreRow = []
        for(i = 1; i< length;i++)
        {
            if(rows[i].cells[2].style.backgroundColor =="rgb(112, 173, 71)" || rows[i].cells[2].style.backgroundColor == "rgb(166, 166, 166)") {
                if(rows[i].cells[3].style.backgroundColor =="rgb(166, 166, 166)" || rows[i].cells[3].style.backgroundColor == "rgb(112, 173, 71)"){
                    if(rows[i].cells[5].style.backgroundColor =="rgb(166, 166, 166)" || rows[i].cells[5].style.backgroundColor == "rgb(112, 173, 71)"){
                        if(rows[i].cells[6].style.backgroundColor =="rgb(166, 166, 166)" || rows[i].cells[6].style.backgroundColor == "rgb(112, 173, 71)")
                        {
                            ignoreRow.push(rows[i].cells[1].innerText)
                        }
                    }
                }
            }
        }
        var element = document.getElementById("packageTableBody")
        if (element != null) { element.parentNode.removeChild(element) }
        packageTableBody = document.createElement("tbody")
        packageTableBody.setAttribute("id","packageTableBody")
        document.getElementById("packageTable").appendChild(packageTableBody)
        for(i=0;i<data1.length;i++)
        {
            if((ownerValue == data1[i].owner || ownerValue == "all")&& ignoreRow.find(element => element == data1[i].packageName) == null)
            {
                createPackageBody(data1,col,i)
            }
        }
        if(ignoreRow.length == length - 1) {
            tr = document.createElement("tr")
            tr.setAttribute("colspan",7)
            th = document.createElement("th")
            th.innerText = "No failed Jobs"
            tr.appendChild(th)
            packageTableBody.appendChild(tr)
        }
    }
}

function displayAll(data1) {
    var request = new XMLHttpRequest()
    request.open('GET', 'http://ps31.fyre.ibm.com:8888/api/distros', true)
    request.onload = function() {
        var data = JSON.parse(this.responseText)
        var col = ["#", "Package Name", "Recipe", "Dockerfile", "Image", "Binary", "Comment", "Size", "Owner"];
        headerCollection = {}
        headerCollection["Dockerfile"] = 3;
            headerCollection["Image"] = 4
            headerCollection["Binary"] = 5
        var scriptsPattern = /^s-/g;
        for (var i = 0; i < data.length; i++) {
            if (data[i] != "Dockerfile" && data[i].match(scriptsPattern) == null && data[i] != "Image" && data[i] != "Binary")
            {
                col.push(data[i]);
                headerCollection[data[i]] = i + 6
            }
        }
        var packageTable = document.createElement("table")
        displayEntireContainer.appendChild(packageTable)
        packageTable.setAttribute("class", "responsive-table")
        packageTable.setAttribute('id', 'entirePackageTable')
        document.getElementById("entirePackageTable").style.display = "none"
        packageTable.setAttribute('align',"center")
        var packageTableHeader = document.createElement("thead")
        packageTable.appendChild(packageTableHeader)
        packageTableHeader.setAttribute('id', "entirePackageTableHeader")
        var packageTableBody = document.createElement("tbody")
        packageTable.appendChild(packageTableBody)
        packageTableBody.setAttribute('id', "entirePackageTableBody")
        var tr = document.getElementById("entirePackageTable").insertRow(-1);
        for (var i = 0; i < col.length; i++) {;
            var th = document.createElement("th");
            th.setAttribute('class', 'packageHeader')
            if(col[i] == "Package Name"){th.setAttribute('colspan','2')}
            else if(col[i] == "Comment"){th.setAttribute('colspan','4')}
            th.setAttribute('title',col[i])
            th.innerHTML = col[i];
            tr.appendChild(th);
        }
        document.getElementById("entirePackageTableHeader").appendChild(tr)
        for (var i = 0; i < data1.length; i++) {
            var tr = entirePackageTable.insertRow(-1)
            for (var j = 0; j < col.length; j++) {
                var td = document.createElement("td");
                if(col[j] == "Package Name"){td.setAttribute('colspan','2')}
                else if(col[j] == "Comment"){td.setAttribute('colspan','4')}
                td.setAttribute('class', 'packageValue')
                if(j==0){
                    td.innerText = i+1
                }
                if(j == 1){
                    td.innerText = data1[i].packageName
                    td.setAttribute("title",data1[i].packageName)
                }
                else if(j == 6){
                    td.innerText = data1[i].comment
                    td.setAttribute("title",data1[i].comment)
                }
                else if(j == 7){
                    td.innerText = data1[i].imageSize
                    td.setAttribute("title",data1[i].imageSize)
                }
                else if(j == 8){
                    td.innerText = (data1[i].owner)[0].toUpperCase() + (data1[i].owner).slice(1)
                    td.setAttribute("title",(data1[i].owner)[0].toUpperCase() + (data1[i].owner).slice(1))
                }
                tr.appendChild(td)
            }
            document.getElementById("entirePackageTableBody").appendChild(tr)
            if (data1[i].verification != null && data1[i].verification.includes("Binary"))
            {
                if(data1[i].ratio < 0){
                    tr.cells[2].style.backgroundColor = "RGB(166,166,166)"
                }
                classifyErrors(tr, data1[i].binaryRatio, data1[i].binaryBroken, data1[i].failureTime, data1[i].jobLastRunTime, 5, true)
            } else {
                if(data1[i].binaryRatio < 0){
                    tr.cells[5].style.backgroundColor = "RGB(166,166,166)"
                }
                classifyErrors(tr, data1[i].ratio, data1[i].broken, data1[i].failureTime, data1[i].jobLastRunTime, 2, true)
            }

           // if(data1[i].packageName != "Erlang" && data1[i].packageName != "HAProxy" && data1[i].packageName != "Sysdig"){
               // classifyErrors(tr, data1[i].scriptRatio, false, data1[i].scriptFailureTime, data1[i].jobLastRunTime, 4, true)
            //} else {
              //  classifyErrors(tr, data1[i].scriptRatio, false, data1[i].scriptFailureTime, data1[i].scriptLastRunTime, 4, true)
            //}

            countCollection = {}
            distroFailure = data1[i].distroFailure
            if (distroFailure != "") {
                failureCount = data1[i].failureCount
                var counts = failureCount.split(",")
                for (var j = 0; j < counts.length; j++) {
                    Count = counts[j].split("=")
                    countCollection[Count[0].trim()] = Count[1]
                }
            }
            var failureName = distroFailure.split(",")
            for (var j = 0; j < failureName.length; j++) {
                distro = failureName[j].trim()
                if (distro == "Dockerfile") {
                    var isDockerfile = true
                    if (data1[i].dockerBroken) {
                        tr.cells[headerCollection[distro]].style.backgroundColor = "RGB(255,0,0)"
                    }
                            else {
                        classifyErrors(tr, countCollection[distro], false, data1[i].failureTime, null, headerCollection[distro], false)
                    }
                    tr.cells[headerCollection[distro]].innerText = formatDate(data1[i].dockerFailureTime)
                }
                        else if (distro == "Image") {
                            if (data1[i].imageBroken) {
                                    tr.cells[headerCollection[distro]].style.backgroundColor = "RGB(255,0,0)"
                            }
                        else {
                                    classifyErrors(tr, countCollection[distro], false, data1[i].failureTime, null, headerCollection[distro], false)
                    }
                    tr.cells[headerCollection[distro]].innerText = formatDate(data1[i].imageFailureTime)
                    }
            if(distro != "Dockerfile" && headerCollection[distro] != null)
            {
                classifyErrors(tr,countCollection[distro],false,data1[i].failureTime, data1[i].successTime, headerCollection[distro],false)
            }
            }
            distroSuccess = data1[i].distroSuccess
            var successName = distroSuccess.split(",")
            for (var j = 0; j < successName.length; j++)
            {
                distro = successName[j].trim()
                if (headerCollection[distro] != null && tr != null)
                {
                            tr.cells[headerCollection[distro]].style.backgroundColor = "RGB(112,173,71)"
                            if (distro == "Image")
                            {
                                    tr.cells[headerCollection[distro]].innerText = formatDate(data1[i].jobLastRunTime)
                            }
                            else if (distro == "Dockerfile")
                            {
                                    tr.cells[headerCollection[distro]].innerText = formatDate(data1[i].dockerLastRunTime)
                            }
                }
            }
            unavailableDistros = data1[i].unavailableDistros
            if (unavailableDistros != null) {
                var unavailableNames = unavailableDistros.split(",")
                for (var j = 0; j < unavailableNames.length; j++) {
                    distro = unavailableNames[j].trim()
                    if (headerCollection[distro] != null) {
                        tr.cells[headerCollection[distro]].style.backgroundColor = "RGB(166,166,166)"
                    }
                }
            }
            if (data1[i].dockerBroken) {
                tr.cells[headerCollection["Dockerfile"]].style.backgroundColor = "RGB(255,0,0)"
            }
                if (data1[i].imageBroken) {
                        tr.cells[headerCollection["Image"]].style.backgroundColor = "RGB(255,0,0)"
                }
                if (data1[i].binaryBroken) {
                        tr.cells[headerCollection["Binary"]].style.backgroundColor = "RGB(255,0,0)"
                }
            for (var j= 8; j < col.length ; j++) {
                if (tr.cells[j].style.backgroundColor == ""){tr.cells[j].style.backgroundColor = "white"}
            }
        }
    }
    request.send()
}

function activateDarkMode() {
    var darkSwitch = document.getElementById("darkModeSwitch")
    mainContainer = document.getElementById("mainContainer")
    contentContainer = document.getElementById("contentContainer")
    distroTable = document.getElementById("distroTable")
    if(darkSwitch.checked == true)
    {
        mainContainer.style = "height: 100vh; width: 100%;background-image: linear-gradient(#121212, #1F1B24);"
        entireContainer.style = "display: none; position: absolute; top: 0px; height: 100vh; width: 100%; background-image: linear-gradient(#121212, #1F1B24);"
        contentContainer.style = "background-color: #1F1B24"
        document.getElementById("mainTitle").style = "color: white;"
        document.getElementById("legendTitle").style = "color: white;"
        document.getElementById("showFailureLabel").style = "color: white;"
        if (distroTable != null)
        {
            document.getElementById("distroTable").setAttribute("class","darkModeDistroTable ")
            document.getElementById("distroHyperlink").style = "color: white;"
            distroTable.rows[1].cells[1].style = "color: white;"
            distroTable.rows[2].cells[1].style = "color: white;"
            distroTable.rows[document.getElementById("recipeRow").innerText].cells[1].style = "color: white;"
        }
        document.getElementById("welcomeUser").style.color = "white"
    }
    else{
        entireContainer.style = "display: none; position: absolute; top: 0px; height: 100vh; width: 100%; background-image: linear-gradient(rgb(184, 236, 214) , rgb(76, 63, 150));"
        mainContainer.style = "height: 100vh; width: 100%; background-image: linear-gradient(rgb(184, 236, 214) , rgb(76, 63, 150));"
        contentContainer.style = "background-image: linear-gradient(rgb(184, 236, 214) , rgb(76, 63, 150));"
        document.getElementById("mainTitle").style = "color: black;"
        document.getElementById("legendTitle").style = "color: black;"
        document.getElementById("showFailureLabel").style = "color: black;"
        if (distroTable != null)
        {

            document.getElementById("distroTable").setAttribute("class","distroTable")
            document.getElementById("distroHyperlink").style = "color: black;"
            distroTable.rows[1].cells[1].style = "color: black;"
            distroTable.rows[2].cells[1].style = "color: black;"
            distroTable.rows[document.getElementById("recipeRow").innerText].cells[1].style = "color: black;"
        }
        document.getElementById("welcomeUser").style.color = "black"
    }
}

function closeEntireContainer() {
    document.getElementById("entireContainer").style.display = "none"
    document.getElementById("displayEntireContainer").style.display = "none"
    document.getElementById("entirePackageTable").style.display = "none"
}

function updateList(data1,recipeRow,recipeCol,binaryRow,binaryCol,binaryVerified) {
    rows = document.getElementById("distroTable").rows;
    packageName = rows[0].cells[0].innerText;
    document.getElementById("distroPkgName").innerText = packageName;
    document.getElementById("deleteRSPkgName").innerText = packageName;

    if (!binaryVerified){
    z = -1;
    do
    {
        z++;
    }while(data1[z].packageName != packageName)
    k = 3 + recipeRow + 1
    l = k
    for(i= 3 , k ; i < 3 + recipeRow;i++)
    {
        for(j=0 ; j < 5 ;j++)
        {
            if(rows[i].cells[j].innerText != "")
            {
                rows[i].cells[j].ondblclick = (function() {
                    document.getElementById("distroColor").innerText = this.style.backgroundColor;
                    document.getElementById("myDistroModal").style.display = "block"
                    document.getElementById("distroName").innerText = this.innerText;
                    if(this.style.backgroundColor == "rgb(166, 166, 166)")
                    {
                        document.getElementById("unavailMsg").innerText = "Remove from Unavailable List?"
                    }
                    else
                    {
                        document.getElementById("unavailMsg").innerText = "Add to Unavailable List?"
                    }
                })
            }
        }
    }
} else {
    z = -1;
    do
    {
        z++;
    }while(data1[z].packageName != packageName)
    k = 3 + binaryRow + 1
    l = k
    for(i= 3 ; i < 3 + binaryRow ;i++)
    {
        for(j=0 ; j < 5 ;j++)
        {
            if(rows[i].cells[j].innerText != "")
            {
                rows[i].cells[j].ondblclick = (function() {
                    document.getElementById("distroColor").innerText = this.style.backgroundColor;
                    document.getElementById("myDistroModal").style.display = "block"
                    document.getElementById("distroName").innerText = this.innerText;
                    if(this.style.backgroundColor == "rgb(166, 166, 166)")
                    {
                        document.getElementById("unavailMsg").innerText = "Remove from Unavailable List?"
                    }
                    else
                    {
                        document.getElementById("unavailMsg").innerText = "Add to Unavailable List?"
                    }
                })
            }
        }
    }
}

    rows[2].cells[0].ondblclick = function() {
        document.getElementById("deleteRSModal").style.display = "block"
        document.getElementById("deleteRSBtn").style.display = "block"
        document.getElementById("deleteRSMsg").innerText = "Mark " + document.getElementById("deleteRSPkgName").innerText +" - Recipe Obsolete?"
        document.getElementById("deleteRors").innerText = "recipe"
    }

    $("#deleteRSBtn").click(function(){
        var URL = "http://ps31.fyre.ibm.com:8888/api/obsolete/" + document.getElementById("deleteRSPkgName").innerText +"?type="+document.getElementById("deleteRorS").innerText
        pkgName = document.getElementById("deleteRSPkgeName").innerText
        writetype = "Remove Obsolete Package"
        mod = document.getElementById("deleteRorS").innerText
        $.ajax({
            url: URL,
            method: "DELETE",
            contentType: "application/json",
            success: function(result) {
                writetoFile(userName,pkgName,writetype,mod)
                document.getElementById("deleteRSModal").style.display = "none"
            },
            failure: function(result) {

            }
        });
    })

    $("#updateBtn").click(function() {
        var distro = document.getElementById("distroName").innerText
        var URL = "http://ps31.fyre.ibm.com:8888/api/packages/" + document.getElementById("distroPkgName").innerText +"/distros"
        if(document.getElementById("distroColor").innerText == "rgb(166, 166, 166)")
        {
            pkgName = document.getElementById("distroPkgName").innerText;
            writetype = "Remove from Unavailable List"
            $.ajax({
                url: URL,
                method: "PUT",
                data : JSON.stringify({"distro" : distro, "type" : "remove"}),
                contentType: "application/json",
                success: function(result) {
                    writetoFile(userName,pkgName,writetype,distro)
                    document.getElementById("myDistroModal").style.display = "none"
                },
                failure: function(result) {
                }
            });
        }
        else
        {
            pkgName = document.getElementById("distroPkgName").innerText;
            writetype = "Add to Unavailable List"
            $.ajax({
                url: URL,
                method: "PUT",
                data : JSON.stringify({"distro" : distro}),
                contentType: "application/json",
                success: function(result) {
                    writetoFile(userName,pkgName,writetype,distro)
                    document.getElementById("myDistroModal").style.display = "none"
                },
                failure: function(result) {
                }
            });
        }
    })
}

function writetoFile(userName,pkgName,writetype,mod) {
    $.ajax({
        url: 'writeFile.php',
        method: 'POST',
        data:{userName:userName,pkgName:pkgName,writetype:writetype,mod:mod},
        success: function(response){
            writetype="";
        }
    })
}

function displayBroken(data1,col) {
    rows = document.getElementById("packageTable").rows
    brokenPkg = []
    for(i = 0 ; i < rows.length ; i ++)
    {
        if(rows[i].cells[2].style.backgroundColor == "rgb(255, 0, 0)" || rows[i].cells[3].style.backgroundColor == "rgb(255, 0, 0)" || rows[i].cells[7].style.backgroundColor == "rgb(255, 0, 0)" || rows[i].cells[6].style.backgroundColor == "rgb(255, 0, 0)")
        {
            brokenPkg.push(rows[i].cells[1].innerText)
        }
    }
    var element = document.getElementById("packageTableBody")
    if (element != null) { element.parentNode.removeChild(element) }
    packageTableBody = document.createElement("tbody")
    packageTableBody.setAttribute("id","packageTableBody")
    document.getElementById("packageTable").appendChild(packageTableBody)
    z = 0;
    i = 0;
    do
    {
        if(brokenPkg.find(element => element == data1[i].packageName) != null)
        {
            createPackageBody(data1,col,i)
        }
        i++;
    }while(z < brokenPkg.length && i < data1.length)
}

const mainTitle = document.createElement('h1')
mainTitle.setAttribute('class', 'mainTitle')
mainTitle.innerText = "Jenkins Summary Report"
document.getElementById('mainTitle').appendChild(mainTitle)
createLegend()
createPackageTable()

userName = ""
var rights
var data1

$.ajax({
    url:"checkLogin.php",
    type: 'GET',
    success: function(response) {
        if(response.length < 50)
        {
            data = JSON.parse(response)
            if(data.a != "")
            {
                isLoggedin = true;
                userName = data.a;
                rights = data.b;
                document.getElementById("mainLoginBtn").style.display = "none"
                document.getElementById("mainLogoutBtn").style.display = "block"
                document.getElementById("welcomeUser").style.display = "block"
                document.getElementById("welcomeUser").innerText = "Welcome " + userName[0].toUpperCase() + userName.slice(1) + "!!!"
                global_author = userName
            }
        }
    }
})

$("#loginBtn").click(function() {
    var username = $("#uname").val().trim();
    var password = $("#psw").val().trim();
    if( username != "" && password != "" ){
        $.ajax({
            url:'checkUser.php',
            type:'post',
            data:{username:username,password:password},
            success:function(response){
                data = JSON.parse(response)
                msg=""
                if(data.a == 1)
                {
                    isLoggedin = true;
                    userName = username;
                    rights = data.b;
                    document.getElementById("id01").style.display = "none"
                    document.getElementById("mainLoginBtn").style.display = "none"
                    document.getElementById("mainLogoutBtn").style.display = "block"
                    document.getElementById("welcomeUser").style.display = "block"
                    document.getElementById("welcomeUser").innerText = "Welcome " + userName[0].toUpperCase() + userName.slice(1) + "!!!"
                    location.reload(true);
                }
                else {
                    msg = "Invalid username and password!";
                }
                $("#message").html(msg);
            }
        });
    }
})

$("#mainLogoutBtn").click(function() {
    userName = ""
    rights = 0
    document.getElementById("mainLogoutBtn").style.display = "none"
    document.getElementById("welcomeUser").style.display = "none"
    document.getElementById("mainLoginBtn").style.display = "block"
    $.ajax({
        url : "checkLogout.php",
        type : 'GET',
        success : function() {
            isLoggedin = false;
            drow = document.getElementById("distroTable").rows
            if(drow != null)
            {
                i = 2
                do
                {
                    drow[i].ondblclick = (function(){
                        document.getElementById("myDistroModal").style.display = "none"
                        document.getElementById("deleteRSModal").style.display = "none"
                    })
                    i++;
                }while(i < drow.length)
            }
        }
    })
})


function showValue(failureDate) {
    // Get the value of the cell
    var value = failureDate;

    // Get the position of the cell
    var rect = cell.getBoundingClientRect();
    var x = rect.left + window.scrollX;
    var y = rect.top + window.scrollY;

    // Show the value in a tooltip
    var tooltip = document.getElementById("tooltip");
    tooltip.innerText = value;
    tooltip.style.display = "block";
    tooltip.style.left = (x + 10) + "px"; // 10px offset from left
    tooltip.style.top = (y + 10) + "px"; // 10px offset from top
}

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("packageTable");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }


