BackendCtrls.factory(
	"transformRequestAsFormPost",
	function() {
		// I prepare the request data for the form post.
		function transformRequest( data, getHeaders ) {
			var headers = getHeaders();
			headers[ "Content-type" ] = "application/x-www-form-urlencoded; charset=utf-8";
			return( serializeData( data ) );
		}
		// Return the factory value.
		return( transformRequest );


		// ---
		// PRVIATE METHODS.
		// ---

		function serializeData( data ) {
			// If this is not an object, defer to native
			// stringification.
			if ( ! angular.isObject( data ) ) {
				return( ( data == null ) ? "" : data.toString() );
			}
			var buffer = [];
			// Serialize each key in the object.
			for ( var name in data ) {
				if ( ! data.hasOwnProperty( name ) ) {
					continue;
				}

				var value = data[ name ];

				// Tricks: Detect if value is an array
				if (Object.prototype.toString.call( value ) === '[object Array]') {
					for (var i = 0; i < value.length; i++) {
						buffer.push(
							encodeURIComponent( name+'['+i+']' ) +
							"=" +
							encodeURIComponent( ( value[i] == null ) ? "" : value[i] )
						);
					}
				} else {
					buffer.push(
						encodeURIComponent( name ) +
						"=" +
						encodeURIComponent( ( value == null ) ? "" : value )
					);
				}
				
			}

			// Serialize the buffer and clean it up for transportation.
			var source = buffer
				.join( "&" )
				.replace( /%20/g, "+" )
			;
			return( source );
		}
	}
);