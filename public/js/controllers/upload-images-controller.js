BackendCtrls
.controller('UploadImagesCtrl', function ($scope,$http, $timeout) {
    
    //console.log($scope.selectedListing);
    if (typeof $scope.isUploadScriptLoaded == "undefined" || !$scope.isUploadScriptLoaded) {
        $timeout(function() {
            ;(function($, $scope){
                'use strict';
                
                //console.log($('#fileupload'));
                // Initialize the jQuery File Upload widget:
                $('#fileupload').fileupload({
                    // Uncomment the following to send cross-domain cookies:
                    //xhrFields: {withCredentials: true},
                    url: '/upload',
                    //paramName : '',
                    //dropZone : $('#dropZone'),
                    
                    //maxNumberOfFiles : 20,
                    
                    // formData : [{
                    //   name : 'listing_id',
                    //   value : listing.id
                    // }],
                    //formData : $('#formId').serializeArray(),
                    //filesContainer : $('#filesContainer'),
                    progress: function (e, data) {
                        // var progress = parseInt(data.loaded / data.total * 100, 10);
                        // data.context.find('.progressBar').css(
                        //     'width',
                        //     progress + '%'
                        // ).html(progress + '%');
                    },
                    acceptFileTypes : /(\.|\/)(gif|jpe?g|png)$/i,
                    //previewMaxWidth : 200,
                    downloadTemplateId : "template-download",
                    uploadTemplateId : "template-upload",
                    //previewMaxHeight : 200,
                    //sequentialUploads : true,
                    
                    autoUpload: true
                });
    
                // Enable iframe cross-domain access via redirect option:
                $('#fileupload').fileupload(
                    'option',
                    'redirect',
                    window.location.href.replace(
                        /\/[^\/]*$/,
                        '/cors/result.html?%s'
                    )
                );
    
                var number = 0;
                var num = 0;
                var maxFile     = 20;
    
                $('#fileupload').bind('fileuploadadded', function (e, data) {
                    //var dropzone    = $('#<?php echo $dropzone?>');
                    //var gallery     = $('#<?php echo $galleryID?>');
                    //gallery.append(dropzone);
                    
                    var self = $(this);
                    
                    var lengthData = data.originalFiles.length;
                    var lengthArr = 0;
                    // $.each(data.originalFiles, function(key, item) {
                    //     num++;
                    //     lengthArr++;
    
                    //     if(item.error) {
                    //         self.find('div.gallery-item[ref="'+item.name+'"]').remove();
                    //         maxFile++;
                    //     }
                    //     if (maxFile!=0 && lengthArr>maxFile) {
                    //         self.find('div.gallery-item[ref="'+item.name+'"]').remove();
                    //     }
                    // });
                    
                    num = number++;
                    num++;
                    
                });
    
                // Callback after added images
                $('#fileupload').bind('fileuploaddone', function (e, data) {
                    // console.log(data);
    
                    var input = $("<input ref=\'"+data.result.files[0].deleteUrl+"\' type=\'hidden\' class='uploadedImage' name=\'images[]\' value=\'"+data.result.files[0].name+"\'/>");
                    $("#inputFiles").append(input);
                    
                    $scope.$apply(function () {
                        $scope.uploadedImages.items[$scope.uploadedImages.items.length] = data.result.files[0];
                    });
                    
                });
    
                $('#fileupload').bind('fileuploaddestroy', function (e, data) {
                    // console.log(data);
    
                    var findObj = $("#inputFiles input[ref='"+data.url+"']");
                    
                    findObj.remove();
                });
                // $('body').on('click', '.deletePhotoGN', function(e){
                //     var fileID = $(this).parent().attr('ref');
                //     var _parent = $(this).parent();
                //     $.ajax({
                //         url : '<?php echo $this->deleteUrl?>?fileid=' + fileID,
                //         success : function(res) {
                //             if (!res.error) {
                //                 _parent.remove();
                //             } else {
                //                 // TODO: Display alert popup
                //             }
    
                //             //<?php echo $this->deletedCallback;?>
                //         }
                //     });
                // });
            }) (jQuery, $scope);
        }, 1000);
        
        $scope.isUploadScriptLoaded = true;
    }

})

   
;
