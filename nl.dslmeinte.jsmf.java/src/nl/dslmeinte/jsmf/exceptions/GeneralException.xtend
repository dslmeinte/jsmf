package nl.dslmeinte.jsmf.exceptions

import static nl.dslmeinte.jsmf.exceptions.ExceptionTypes.*

class GeneralException extends RuntimeException {

	public val ExceptionTypes exceptionType

	new(ExceptionTypes exceptionType, String message) {
		super(message)
		this.exceptionType = exceptionType
	}

	new(ExceptionTypes exceptionType, String message, Throwable cause) {
		super(message, cause)
		this.exceptionType = exceptionType
	}

	def static format(String message) {
		new GeneralException(format, message)
	}

	def static format(String message, Throwable cause) {
		new GeneralException(format, message, cause)
	}

	def static typing(String message) {
		new GeneralException(typing, message)
	}

}


enum ExceptionTypes {

	format, typing

}

